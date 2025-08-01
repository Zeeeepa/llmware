// Core API types for llmware integration

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx';
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  processingProgress?: number;
  metadata?: {
    pages?: number;
    wordCount?: number;
    language?: string;
    tags?: string[];
  };
}

export interface Model {
  id: string;
  name: string;
  displayName: string;
  type: 'generative' | 'slim' | 'embedding';
  category: 'ner' | 'summary' | 'qa' | 'classification' | 'chat' | 'other';
  size: string;
  status: 'available' | 'loaded' | 'loading' | 'error';
  supportsGPU: boolean;
  description?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface RAGQuery {
  id: string;
  query: string;
  modelId: string;
  documentIds: string[];
  timestamp: string;
  results?: RAGResult[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface RAGResult {
  id: string;
  content: string;
  confidence: number;
  sourceDocument: {
    id: string;
    name: string;
    page?: number;
    section?: string;
  };
  metadata?: {
    tokens?: number;
    processingTime?: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  tools: AgentTool[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: string;
  lastRun?: string;
}

export interface AgentTool {
  id: string;
  name: string;
  type: 'document_parser' | 'ner_extractor' | 'summarizer' | 'qa_tool' | 'classifier';
  modelId: string;
  config?: Record<string, any>;
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected tools
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  steps: AgentStep[];
  results?: Record<string, any>;
}

export interface AgentStep {
  id: string;
  toolId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  input?: any;
  output?: any;
  error?: string;
}

export interface Embedding {
  id: string;
  documentId: string;
  modelId: string;
  vector: number[];
  metadata: {
    chunkIndex: number;
    text: string;
    tokens: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    modelId?: string;
    sources?: string[];
    confidence?: number;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  config: {
    modelId: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, any>;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'document_processing' | 'model_loading' | 'agent_execution' | 'chat_response';
  payload: any;
  timestamp: string;
}

export interface DocumentProcessingMessage extends WebSocketMessage {
  type: 'document_processing';
  payload: {
    documentId: string;
    status: Document['status'];
    progress?: number;
    error?: string;
  };
}

export interface ModelLoadingMessage extends WebSocketMessage {
  type: 'model_loading';
  payload: {
    modelId: string;
    status: Model['status'];
    progress?: number;
    error?: string;
  };
}

export interface AgentExecutionMessage extends WebSocketMessage {
  type: 'agent_execution';
  payload: {
    executionId: string;
    agentId: string;
    status: AgentExecution['status'];
    currentStep?: AgentStep;
    error?: string;
  };
}

export interface ChatResponseMessage extends WebSocketMessage {
  type: 'chat_response';
  payload: {
    sessionId: string;
    messageId: string;
    content: string;
    isComplete: boolean;
    sources?: string[];
  };
}

