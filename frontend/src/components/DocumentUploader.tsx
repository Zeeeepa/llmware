import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatFileSize, getFileIcon } from '@/lib/utils'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface DocumentUploaderProps {
  onUpload?: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  className?: string
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/json': ['.json']
}

export function DocumentUploader({
  onUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = Object.keys(ACCEPTED_TYPES),
  className
}: DocumentUploaderProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadFiles(prev => [...prev, ...newFiles])

    // Simulate upload process
    for (const uploadFile of newFiles) {
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading' }
            : f
        )
      )

      try {
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress }
                : f
            )
          )
        }

        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        )

        if (onUpload) {
          await onUpload([uploadFile.file])
        }
      } catch (error) {
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        )
      }
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = ACCEPTED_TYPES[type as keyof typeof ACCEPTED_TYPES] || []
      return acc
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize,
    multiple: true
  })

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = async (id: string) => {
    const file = uploadFiles.find(f => f.id === id)
    if (!file) return

    setUploadFiles(prev => 
      prev.map(f => 
        f.id === id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    )

    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === id 
              ? { ...f, progress }
              : f
          )
        )
      }

      setUploadFiles(prev => 
        prev.map(f => 
          f.id === id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        )
      )

      if (onUpload) {
        await onUpload([file.file])
      }
    } catch (error) {
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        )
      )
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive 
                  ? 'Drop files here...' 
                  : 'Drag & drop files here, or click to select'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, TXT, CSV, XLSX files up to {formatFileSize(maxSize)}
              </p>
            </div>
          </div>

          {fileRejections.length > 0 && (
            <div className="mt-4 space-y-2">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{file.name}: {errors[0]?.message}</span>
                </div>
              ))}
            </div>
          )}

          {uploadFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Upload Progress</h4>
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">
                    {getFileIcon(uploadFile.file.name.split('.').pop() || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            uploadFile.status === 'completed' ? 'success' :
                            uploadFile.status === 'error' ? 'destructive' :
                            uploadFile.status === 'uploading' ? 'info' : 'secondary'
                          }
                        >
                          {uploadFile.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      {uploadFile.status === 'uploading' && (
                        <>
                          <span>•</span>
                          <span>{uploadFile.progress}%</span>
                        </>
                      )}
                    </div>
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-2 h-2" />
                    )}
                    {uploadFile.error && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-destructive">{uploadFile.error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(uploadFile.id)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
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

