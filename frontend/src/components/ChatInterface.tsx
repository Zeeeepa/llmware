import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, Paperclip, Settings, Trash2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, copyToClipboard } from '@/lib/utils'
import type { ChatMessage, ChatSession } from '@/types/api'

interface ChatInterfaceProps {
  session?: ChatSession
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  onClearChat?: () => void
  onAttachFile?: () => void
  onVoiceInput?: () => void
  isLoading?: boolean
  className?: string
}

export function ChatInterface({
  session,
  messages,
  onSendMessage,
  onClearChat,
  onAttachFile,
  onVoiceInput,
  isLoading = false,
  className
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    if (onVoiceInput) {
      onVoiceInput()
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await copyToClipboard(content)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const getMessageIcon = (role: ChatMessage['role']) => {
    switch (role) {
      case 'user':
        return '👤'
      case 'assistant':
        return '🤖'
      case 'system':
        return '⚙️'
      default:
        return '💬'
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              💬 {session?.name || 'llmware Assistant'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {session?.config.modelId && (
                <Badge variant="outline">
                  {session.config.modelId}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="text-6xl">🤖</div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Hello! I can help you with document analysis, RAG queries, and agent workflows.
                  </h3>
                  <p className="text-muted-foreground">
                    What would you like to work on today?
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 max-w-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage('Analyze my documents for key insights')}
                  >
                    📄 Analyze Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage('Help me set up a RAG pipeline')}
                  >
                    🔍 Setup RAG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage('Create an agent workflow')}
                  >
                    🤖 Create Agent
                  </Button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 max-w-4xl',
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {getMessageIcon(message.role)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex-1 space-y-2',
                      message.role === 'user' ? 'text-right' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'inline-block p-3 rounded-lg max-w-full',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      {message.metadata?.sources && message.metadata.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs opacity-75 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.sources.map((source, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(message.timestamp)}</span>
                      {message.metadata?.confidence && (
                        <>
                          <span>•</span>
                          <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                        </>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.role === 'assistant' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                    🤖
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {onAttachFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onAttachFile}
                    >
                      <Paperclip className="h-3 w-3" />
                    </Button>
                  )}
                  {onVoiceInput && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6',
                        isRecording && 'text-red-500 animate-pulse'
                      )}
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

