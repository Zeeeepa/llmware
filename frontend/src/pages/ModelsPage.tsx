import React, { useState } from 'react'
import { ModelSelector } from '@/components/ModelSelector'
import type { Model } from '@/types/api'

// Mock data for demonstration
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
    name: 'slim-summary-tool',
    displayName: 'SLIM Summary Tool',
    type: 'slim',
    category: 'summary',
    size: '512MB',
    status: 'loaded',
    supportsGPU: true,
    description: 'Document summarization tool'
  },
  {
    id: 'model-4',
    name: 'embedding-model',
    displayName: 'Embedding Model',
    type: 'embedding',
    category: 'other',
    size: '1.2GB',
    status: 'available',
    supportsGPU: true,
    description: 'Text embedding model for semantic search'
  }
]

export function ModelsPage() {
  const [models, setModels] = useState<Model[]>(mockModels)
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    models.find(m => m.status === 'loaded')
  )

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model)
  }

  const handleModelLoad = async (modelId: string) => {
    setModels(prev => 
      prev.map(m => 
        m.id === modelId 
          ? { ...m, status: 'loading' }
          : m
      )
    )

    // Simulate loading
    setTimeout(() => {
      setModels(prev => 
        prev.map(m => 
          m.id === modelId 
            ? { ...m, status: 'loaded' }
            : m
        )
      )
    }, 2000)
  }

  const handleModelUnload = async (modelId: string) => {
    setModels(prev => 
      prev.map(m => 
        m.id === modelId 
          ? { ...m, status: 'available' }
          : m
      )
    )

    if (selectedModel?.id === modelId) {
      setSelectedModel(undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Models</h1>
        <p className="text-muted-foreground">
          Manage and configure AI models
        </p>
      </div>

      <ModelSelector
        models={models}
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
        onModelLoad={handleModelLoad}
        onModelUnload={handleModelUnload}
        showDetails={true}
      />
    </div>
  )
}

