import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../ChatInterface'
import type { ChatMessage, ChatSession } from '@/types/api'

const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, can you help me analyze my documents?',
    timestamp: '2024-01-15T10:00:00Z'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Hello! I\'d be happy to help you analyze your documents. Please upload them and I\'ll get started.',
    timestamp: '2024-01-15T10:00:30Z',
    metadata: {
      modelId: 'bling-phi-3-gguf',
      confidence: 0.95,
      sources: ['document1.pdf', 'document2.pdf']
    }
  }
]

const mockSession: ChatSession = {
  id: 'session-1',
  name: 'Document Analysis Chat',
  messages: mockMessages,
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T10:00:30Z',
  config: {
    modelId: 'bling-phi-3-gguf',
    temperature: 0.7,
    maxTokens: 2048
  }
}

describe('ChatInterface', () => {
  const mockOnSendMessage = vi.fn()
  const mockOnClearChat = vi.fn()
  const mockOnAttachFile = vi.fn()
  const mockOnVoiceInput = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chat interface correctly', () => {
    render(
      <ChatInterface
        session={mockSession}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText('Document Analysis Chat')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument() // Send button
  })

  it('displays messages correctly', () => {
    render(
      <ChatInterface
        session={mockSession}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText('Hello, can you help me analyze my documents?')).toBeInTheDocument()
    expect(screen.getByText(/I'd be happy to help you analyze your documents/)).toBeInTheDocument()
  })

  it('shows model badge when session has model config', () => {
    render(
      <ChatInterface
        session={mockSession}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText('bling-phi-3-gguf')).toBeInTheDocument()
  })

  it('displays message sources', () => {
    render(
      <ChatInterface
        session={mockSession}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText('Sources:')).toBeInTheDocument()
    expect(screen.getByText('document1.pdf')).toBeInTheDocument()
    expect(screen.getByText('document2.pdf')).toBeInTheDocument()
  })

  it('displays confidence score', () => {
    render(
      <ChatInterface
        session={mockSession}
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText('Confidence: 95%')).toBeInTheDocument()
  })

  it('sends message on form submit', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: '' })
    
    await user.type(input, 'Test message')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    
    await user.type(input, 'Test message')
    await user.keyboard('{Enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('does not send message on Shift+Enter', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    
    await user.type(input, 'Test message')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement
    
    await user.type(input, 'Test message')
    await user.keyboard('{Enter}')
    
    expect(input.value).toBe('')
  })

  it('disables input and send button when loading', () => {
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: '' })
    
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('shows loading indicator when loading', () => {
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
      />
    )
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    expect(screen.getByText(/Hello! I can help you with document analysis/)).toBeInTheDocument()
    expect(screen.getByText('📄 Analyze Documents')).toBeInTheDocument()
    expect(screen.getByText('🔍 Setup RAG')).toBeInTheDocument()
    expect(screen.getByText('🤖 Create Agent')).toBeInTheDocument()
  })

  it('sends predefined message when quick action is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const analyzeButton = screen.getByText('📄 Analyze Documents')
    await user.click(analyzeButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Analyze my documents for key insights')
  })

  it('calls onClearChat when clear button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        onClearChat={mockOnClearChat}
      />
    )
    
    const clearButton = screen.getByRole('button', { name: '' }) // Trash icon
    await user.click(clearButton)
    
    expect(mockOnClearChat).toHaveBeenCalled()
  })

  it('calls onAttachFile when attach button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
        onAttachFile={mockOnAttachFile}
      />
    )
    
    const attachButton = screen.getByRole('button', { name: '' }) // Paperclip icon
    await user.click(attachButton)
    
    expect(mockOnAttachFile).toHaveBeenCalled()
  })

  it('calls onVoiceInput when voice button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
        onVoiceInput={mockOnVoiceInput}
      />
    )
    
    const voiceButton = screen.getByRole('button', { name: '' }) // Mic icon
    await user.click(voiceButton)
    
    expect(mockOnVoiceInput).toHaveBeenCalled()
  })

  it('does not send empty messages', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const sendButton = screen.getByRole('button', { name: '' })
    await user.click(sendButton)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('trims whitespace from messages', async () => {
    const user = userEvent.setup()
    
    render(
      <ChatInterface
        messages={[]}
        onSendMessage={mockOnSendMessage}
      />
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    
    await user.type(input, '  Test message  ')
    await user.keyboard('{Enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })
})

