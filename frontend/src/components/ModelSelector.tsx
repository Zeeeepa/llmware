import React, { useState } from 'react'
import { Check, ChevronDown, Search, Cpu, Zap, Brain, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, getModelIcon, getStatusColor } from '@/lib/utils'
import type { Model } from '@/types/api'

interface ModelSelectorProps {
  models: Model[]
  selectedModel?: Model
  onModelSelect: (model: Model) => void
  onModelLoad?: (modelId: string) => void
  onModelUnload?: (modelId: string) => void
  className?: string
  showDetails?: boolean
}

export function ModelSelector({
  models,
  selectedModel,
  onModelSelect,
  onModelLoad,
  onModelUnload,
  className,
  showDetails = true
}: ModelSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isOpen, setIsOpen] = useState(false)

  const categories = [
    { id: 'all', label: 'All Models', icon: Brain },
    { id: 'generative', label: 'Generative', icon: Brain },
    { id: 'slim', label: 'SLIM Tools', icon: Tag },
    { id: 'embedding', label: 'Embeddings', icon: Search }
  ]

  const filteredModels = models.filter(model => {
    const matchesSearch = model.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || model.type === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleModelAction = async (model: Model, action: 'load' | 'unload') => {
    if (action === 'load' && onModelLoad) {
      await onModelLoad(model.id)
    } else if (action === 'unload' && onModelUnload) {
      await onModelUnload(model.id)
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Model Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-3 w-3" />
                    {category.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Selected Model Display */}
          {selectedModel && (
            <div className="p-3 border rounded-lg bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getModelIcon(selectedModel.type)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedModel.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedModel.size} • {selectedModel.category}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Selected</Badge>
              </div>
            </div>
          )}

          {/* Model List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No models found matching your criteria</p>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent",
                    selectedModel?.id === model.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => onModelSelect(model)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">
                        {getModelIcon(model.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{model.displayName}</p>
                          <Badge 
                            variant={
                              model.status === 'loaded' ? 'success' :
                              model.status === 'loading' ? 'info' :
                              model.status === 'error' ? 'destructive' : 'secondary'
                            }
                            className="shrink-0"
                          >
                            {model.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{model.size}</span>
                          <span>•</span>
                          <span className="capitalize">{model.category}</span>
                          {model.supportsGPU && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span>GPU</span>
                              </div>
                            </>
                          )}
                        </div>
                        {showDetails && model.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      {selectedModel?.id === model.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      
                      {model.status === 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleModelAction(model, 'load')
                          }}
                          disabled={model.status === 'loading'}
                        >
                          Load
                        </Button>
                      )}
                      
                      {model.status === 'loaded' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleModelAction(model, 'unload')
                          }}
                        >
                          Unload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Model Stats */}
          {showDetails && (
            <div className="pt-3 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {models.filter(m => m.status === 'loaded').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Loaded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {models.filter(m => m.status === 'available').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {models.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

