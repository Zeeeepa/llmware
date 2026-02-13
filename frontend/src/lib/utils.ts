import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getFileIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'txt':
      return '📄'
    case 'csv':
      return '📊'
    case 'xlsx':
    case 'xls':
      return '📊'
    case 'json':
      return '📋'
    default:
      return '📄'
  }
}

export function getModelIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'generative':
      return '🤖'
    case 'slim':
      return '🏷️'
    case 'embedding':
      return '🔍'
    default:
      return '⚙️'
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'processed':
    case 'loaded':
      return 'text-green-600 bg-green-100'
    case 'processing':
    case 'loading':
    case 'running':
      return 'text-blue-600 bg-blue-100'
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-100'
    case 'pending':
    case 'available':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.prepend(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Failed to copy text: ', error)
    } finally {
      textArea.remove()
    }
    
    return Promise.resolve()
  }
}

