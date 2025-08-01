import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModelSelector } from '../ModelSelector'
import type { Model } from '@/types/api'

const mockModels: Model[] = [
  {
    id: 'model-1',
    name: 'bling-phi-3-gguf',
    displayName: 'Bling Phi-3 GGUF',
    type: 'generative',
    category: 'chat',
    size: '2.3GB',
    status: 'loaded',
    supportsGPU: true,
    description: 'A powerful generative model for chat applications'
  },
  {
    id: 'model-2',
    name: 'slim-ner-tool',
    displayName: 'SLIM NER Tool',
    type: 'slim',
    category: 'ner',
    size: '435MB',
    status: 'available',
    supportsGPU: false,
    description: 'Named entity recognition tool'
  },
  {
    id: 'model-3',
    name: 'embedding-model',
    displayName: 'Embedding Model',
    type: 'embedding',
    category: 'other',
    size: '1.2GB',
    status: 'loading',
    supportsGPU: true
  }
]

describe('ModelSelector', () => {
  const mockOnModelSelect = vi.fn()
  const mockOnModelLoad = vi.fn()
  const mockOnModelUnload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders model catalog correctly', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        onModelLoad={mockOnModelLoad}
        onModelUnload={mockOnModelUnload}
      />
    )
    
    expect(screen.getByText('Model Catalog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search models...')).toBeInTheDocument()
  })

  it('displays all models by default', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    expect(screen.getByText('Bling Phi-3 GGUF')).toBeInTheDocument()
    expect(screen.getByText('SLIM NER Tool')).toBeInTheDocument()
    expect(screen.getByText('Embedding Model')).toBeInTheDocument()
  })

  it('filters models by search term', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search models...')
    await user.type(searchInput, 'bling')
    
    expect(screen.getByText('Bling Phi-3 GGUF')).toBeInTheDocument()
    expect(screen.queryByText('SLIM NER Tool')).not.toBeInTheDocument()
    expect(screen.queryByText('Embedding Model')).not.toBeInTheDocument()
  })

  it('filters models by category', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    const slimButton = screen.getByText('SLIM Tools')
    await user.click(slimButton)
    
    expect(screen.queryByText('Bling Phi-3 GGUF')).not.toBeInTheDocument()
    expect(screen.getByText('SLIM NER Tool')).toBeInTheDocument()
    expect(screen.queryByText('Embedding Model')).not.toBeInTheDocument()
  })

  it('shows selected model', () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={mockModels[0]}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    expect(screen.getByText('Selected')).toBeInTheDocument()
    expect(screen.getByText('Bling Phi-3 GGUF')).toBeInTheDocument()
  })

  it('calls onModelSelect when model is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    const modelCard = screen.getByText('SLIM NER Tool').closest('div')
    await user.click(modelCard!)
    
    expect(mockOnModelSelect).toHaveBeenCalledWith(mockModels[1])
  })

  it('shows load button for available models', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        onModelLoad={mockOnModelLoad}
      />
    )
    
    const loadButtons = screen.getAllByText('Load')
    expect(loadButtons).toHaveLength(1) // Only available model should have load button
  })

  it('shows unload button for loaded models', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        onModelUnload={mockOnModelUnload}
      />
    )
    
    const unloadButtons = screen.getAllByText('Unload')
    expect(unloadButtons).toHaveLength(1) // Only loaded model should have unload button
  })

  it('calls onModelLoad when load button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        onModelLoad={mockOnModelLoad}
      />
    )
    
    const loadButton = screen.getByText('Load')
    await user.click(loadButton)
    
    expect(mockOnModelLoad).toHaveBeenCalledWith('model-2')
    expect(mockOnModelSelect).not.toHaveBeenCalled() // Should not select when loading
  })

  it('calls onModelUnload when unload button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        onModelUnload={mockOnModelUnload}
      />
    )
    
    const unloadButton = screen.getByText('Unload')
    await user.click(unloadButton)
    
    expect(mockOnModelUnload).toHaveBeenCalledWith('model-1')
    expect(mockOnModelSelect).not.toHaveBeenCalled() // Should not select when unloading
  })

  it('displays model status badges correctly', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    expect(screen.getByText('loaded')).toBeInTheDocument()
    expect(screen.getByText('available')).toBeInTheDocument()
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows GPU indicator for GPU-enabled models', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    const gpuIndicators = screen.getAllByText('GPU')
    expect(gpuIndicators).toHaveLength(2) // Two models support GPU
  })

  it('displays model statistics', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        showDetails={true}
      />
    )
    
    expect(screen.getByText('1')).toBeInTheDocument() // Loaded count
    expect(screen.getByText('Loaded')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('hides details when showDetails is false', () => {
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
        showDetails={false}
      />
    )
    
    expect(screen.queryByText('Loaded')).not.toBeInTheDocument()
    expect(screen.queryByText('A powerful generative model')).not.toBeInTheDocument()
  })

  it('shows empty state when no models match filter', async () => {
    const user = userEvent.setup()
    
    render(
      <ModelSelector
        models={mockModels}
        onModelSelect={mockOnModelSelect}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search models...')
    await user.type(searchInput, 'nonexistent')
    
    expect(screen.getByText('No models found matching your criteria')).toBeInTheDocument()
  })
})

