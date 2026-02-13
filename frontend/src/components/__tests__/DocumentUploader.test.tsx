import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentUploader } from '../DocumentUploader'

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
    fileRejections: []
  }))
}))

describe('DocumentUploader', () => {
  const mockOnUpload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload area correctly', () => {
    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument()
    expect(screen.getByText(/Supports PDF, DOCX, TXT, CSV, XLSX files/)).toBeInTheDocument()
  })

  it('displays upload icon', () => {
    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    const uploadIcon = document.querySelector('[data-lucide="upload"]')
    expect(uploadIcon).toBeInTheDocument()
  })

  it('shows drag active state', () => {
    const { useDropzone } = require('react-dropzone')
    useDropzone.mockReturnValue({
      getRootProps: () => ({ 'data-testid': 'dropzone' }),
      getInputProps: () => ({ 'data-testid': 'file-input' }),
      isDragActive: true,
      fileRejections: []
    })

    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    expect(screen.getByText('Drop files here...')).toBeInTheDocument()
  })

  it('displays file rejections', () => {
    const { useDropzone } = require('react-dropzone')
    useDropzone.mockReturnValue({
      getRootProps: () => ({ 'data-testid': 'dropzone' }),
      getInputProps: () => ({ 'data-testid': 'file-input' }),
      isDragActive: false,
      fileRejections: [
        {
          file: { name: 'test.exe' },
          errors: [{ message: 'File type not accepted' }]
        }
      ]
    })

    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    expect(screen.getByText('test.exe: File type not accepted')).toBeInTheDocument()
  })

  it('accepts custom props', () => {
    render(
      <DocumentUploader 
        onUpload={mockOnUpload}
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        className="custom-class"
      />
    )
    
    const container = document.querySelector('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('handles upload simulation', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    const { useDropzone } = require('react-dropzone')
    let onDropCallback: (files: File[]) => void
    
    useDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false,
        fileRejections: []
      }
    })

    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    // Simulate file drop
    onDropCallback!([mockFile])
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument()
    }, { timeout: 2000 })

    expect(mockOnUpload).toHaveBeenCalledWith([mockFile])
  })

  it('handles upload errors', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const mockOnUploadError = vi.fn().mockRejectedValue(new Error('Upload failed'))
    
    const { useDropzone } = require('react-dropzone')
    let onDropCallback: (files: File[]) => void
    
    useDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false,
        fileRejections: []
      }
    })

    render(<DocumentUploader onUpload={mockOnUploadError} />)
    
    // Simulate file drop
    onDropCallback!([mockFile])
    
    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    }, { timeout: 2000 })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('allows file removal', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    const { useDropzone } = require('react-dropzone')
    let onDropCallback: (files: File[]) => void
    
    useDropzone.mockImplementation(({ onDrop }: { onDrop: (files: File[]) => void }) => {
      onDropCallback = onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false,
        fileRejections: []
      }
    })

    render(<DocumentUploader onUpload={mockOnUpload} />)
    
    // Simulate file drop
    onDropCallback!([mockFile])
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Click remove button
    const removeButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
    })
  })
})

