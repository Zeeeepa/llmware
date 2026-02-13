import React, { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Download, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DocumentUploader } from '@/components/DocumentUploader'
import { cn, formatFileSize, formatDate, getFileIcon, getStatusColor } from '@/lib/utils'
import type { Document } from '@/types/api'

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'contract_001.pdf',
    type: 'pdf',
    size: 2048576,
    uploadedAt: '2024-01-15T10:00:00Z',
    status: 'processed',
    metadata: {
      pages: 12,
      wordCount: 3500,
      language: 'en',
      tags: ['contract', 'legal']
    }
  },
  {
    id: 'doc-2',
    name: 'financial_report.xlsx',
    type: 'xlsx',
    size: 1536000,
    uploadedAt: '2024-01-14T15:30:00Z',
    status: 'processing',
    processingProgress: 65
  },
  {
    id: 'doc-3',
    name: 'meeting_notes.docx',
    type: 'docx',
    size: 512000,
    uploadedAt: '2024-01-13T09:15:00Z',
    status: 'failed'
  },
  {
    id: 'doc-4',
    name: 'research_paper.pdf',
    type: 'pdf',
    size: 4096000,
    uploadedAt: '2024-01-12T14:20:00Z',
    status: 'processed',
    metadata: {
      pages: 24,
      wordCount: 8500,
      language: 'en',
      tags: ['research', 'ai', 'nlp']
    }
  }
]

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showUploader, setShowUploader] = useState(false)

  const fileTypes = [
    { id: 'all', label: 'All Files', count: documents.length },
    { id: 'pdf', label: 'PDFs', count: documents.filter(d => d.type === 'pdf').length },
    { id: 'docx', label: 'Documents', count: documents.filter(d => d.type === 'docx').length },
    { id: 'xlsx', label: 'Spreadsheets', count: documents.filter(d => d.type === 'xlsx').length },
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'all' || doc.type === selectedType
    
    return matchesSearch && matchesType
  })

  const handleUpload = async (files: File[]) => {
    // Simulate document upload
    const newDocuments = files.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() as Document['type'],
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing' as const,
      processingProgress: 0
    }))

    setDocuments(prev => [...newDocuments, ...prev])
    setShowUploader(false)

    // Simulate processing
    newDocuments.forEach(doc => {
      setTimeout(() => {
        setDocuments(prev => 
          prev.map(d => 
            d.id === doc.id 
              ? { ...d, status: 'processed', processingProgress: 100 }
              : d
          )
        )
      }, 3000)
    })
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const getStatusBadge = (document: Document) => {
    switch (document.status) {
      case 'processed':
        return <Badge variant="success">Processed</Badge>
      case 'processing':
        return <Badge variant="info">Processing {document.processingProgress}%</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'uploading':
        return <Badge variant="info">Uploading</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage and process your document library
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload Documents</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUploader(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DocumentUploader onUpload={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {fileTypes.map((type) => (
          <Card 
            key={type.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              selectedType === type.id && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedType(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {type.label}
                  </p>
                  <p className="text-2xl font-bold">{type.count}</p>
                </div>
                <div className="text-2xl">
                  {type.id === 'pdf' ? '📄' : 
                   type.id === 'docx' ? '📝' : 
                   type.id === 'xlsx' ? '📊' : '📁'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && selectedType === 'all' && (
                <Button onClick={() => setShowUploader(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="text-2xl">
                    {getFileIcon(document.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      {getStatusBadge(document)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(document.size)}</span>
                      <span>{formatDate(document.uploadedAt)}</span>
                      {document.metadata?.pages && (
                        <span>{document.metadata.pages} pages</span>
                      )}
                      {document.metadata?.wordCount && (
                        <span>{document.metadata.wordCount.toLocaleString()} words</span>
                      )}
                    </div>
                    {document.metadata?.tags && (
                      <div className="flex gap-1 mt-2">
                        {document.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

