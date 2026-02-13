import React, { useState } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import type { ChatMessage, ChatSession } from '@/types/api'

// Mock data for demonstration
const mockSession: ChatSession = {
  id: 'session-1',
  name: 'llmware Assistant',
  messages: [],
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T09:00:00Z',
  config: {
    modelId: 'bling-phi-3-gguf',
    temperature: 0.7,
    maxTokens: 2048
  }
}

export function ChatPage() {
  const [session, setSession] = useState<ChatSession>(mockSession)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `I understand you're asking about: "${content}". This is a simulated response from the llmware assistant. In a real implementation, this would connect to the llmware backend to process your request using the configured model and any relevant documents.`,
        timestamp: new Date().toISOString(),
        metadata: {
          modelId: session.config.modelId,
          confidence: 0.85
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const handleAttachFile = () => {
    // TODO: Implement file attachment
    console.log('Attach file clicked')
  }

  const handleVoiceInput = () => {
    // TODO: Implement voice input
    console.log('Voice input clicked')
  }

  return (
    <div className="h-full">
      <ChatInterface
        session={session}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        onAttachFile={handleAttachFile}
        onVoiceInput={handleVoiceInput}
        isLoading={isLoading}
        className="h-full"
      />
    </div>
  )
}

