import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react'
import { useDropzone, type Accept } from 'react-dropzone'
import { createHttpClient } from '@/lib/http-client'
import { cn } from '@/lib/utils'
import {
  compressImage,
  getImageMetadata,
  formatFileSize,
  type CompressionOptions,
  type ImageMetadata,
} from '@/utils/image-compression'
import { toPartialUrl, toFullUrl } from '@/utils/image-url-helpers'
import { toast } from '@/utils/toast-utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export interface ImageUploaderProps {
  /** Callback when image is successfully uploaded. Receives the partial URL (not full URL) */
  onUploadSuccess?: (
    partialUrl: string | null,
    fullResponseData?: unknown
  ) => void
  /** Optional callback to get the current partial URL value */
  onPartialUrlChange?: (partialUrl: string | null) => void
  /** Callback when upload fails */
  onUploadError?: (error: Error | string) => void
  /** Custom upload function. If provided, this will be used instead of the default API upload */
  customUploadFn?: (file: File) => Promise<ResponseApi<unknown>>
  /** API endpoint URL for uploading (e.g., '/client/upload/image'). Used if customUploadFn is not provided */
  uploadUrl?: string
  /** FormData field name for the file (default: 'file') */
  fieldName?: string
  /** Additional FormData fields to include in the upload */
  additionalFields?: Record<string, string>
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number
  /** Accepted file types (default: accepts all images) */
  accept?: Accept
  /** Current image URL to display (for editing existing images) */
  currentImageUrl?: string
  /** Initial preview image URL */
  initialPreview?: string
  /** Whether to show the preview */
  showPreview?: boolean
  /** Size variant */
  variant?: 'default' | 'compact' | 'large'
  /** Additional CSS classes */
  className?: string
  /** Additional classes for the upload root element (border/background sizing). */
  rootClassName?: string
  /** Texto do botão principal (ex.: "Imagem", "Ficheiro"). Se omitido, não mostra botão extra. */
  actionButtonLabel?: string
  /** Mostra o texto do botão principal. Default: true */
  actionButtonShowLabel?: boolean
  /** Overrides for the action button styling (className merged). */
  actionButtonClassName?: string
  /** Mostra um botão de remover mesmo quando não há imagem carregada. */
  showRemoveButtonAlways?: boolean
  /** Ícone a mostrar no estado vazio (ex.: silhueta). Se omitido, usa o ícone padrão. */
  placeholderIcon?: React.ReactNode
  /** Mostrar hint de formatos (PNG/JPG/...). Default: true */
  showFileTypesHint?: boolean
  /** Whether the uploader is disabled */
  disabled?: boolean
  /** Text to display when no image is selected */
  placeholder?: string
  /** Whether to automatically upload on file selection */
  autoUpload?: boolean
  /** Functionalidade ID for the HTTP client */
  idFuncionalidade?: string
  /** Enable image compression before upload */
  enableCompression?: boolean
  /** Compression options */
  compressionOptions?: CompressionOptions
  /** Maximum image width in pixels */
  maxWidth?: number
  /** Maximum image height in pixels */
  maxHeight?: number
  /** Minimum image width in pixels */
  minWidth?: number
  /** Minimum image height in pixels */
  minHeight?: number
  /** Maximum retry attempts on upload failure (default: 3) */
  maxRetries?: number
  /** Show image metadata in preview */
  showMetadata?: boolean
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  onPartialUrlChange,
  customUploadFn,
  uploadUrl,
  fieldName = 'file',
  additionalFields,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = { 'image/*': [] },
  currentImageUrl,
  initialPreview,
  showPreview = true,
  variant = 'default',
  className,
  rootClassName,
  disabled = false,
  placeholder = 'Clique ou arraste uma imagem aqui',
  autoUpload = true,
  idFuncionalidade,
  enableCompression = true,
  compressionOptions,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  maxRetries = 3,
  showMetadata = true,
  actionButtonLabel,
  actionButtonShowLabel = true,
  actionButtonClassName,
  showRemoveButtonAlways = false,
  placeholderIcon,
  showFileTypesHint = true,
}: ImageUploaderProps) {
  const supportedTypesLabel = useMemo(() => {
    const keys = Object.keys(accept ?? {})
    if (keys.length === 0) return 'PNG, JPG, JPEG, WEBP, GIF'
    return keys
      .map((k) => k.replace('image/', '').toUpperCase())
      .join(', ')
  }, [accept])

  // ⚠️ CRITICAL: Store partial URLs internally (for form state/database)
  // Convert incoming currentImageUrl (might be full) to partial for storage
  const normalizedCurrentUrl = useMemo(() => {
    const url = initialPreview || currentImageUrl || null
    return toPartialUrl(url)
  }, [initialPreview, currentImageUrl])

  const [uploadedPartialUrl, setUploadedPartialUrl] = useState<string | null>(
    normalizedCurrentUrl
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const objectUrlRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingFromExternalRef = useRef(false)
  const hasUserInteractionRef = useRef(false)

  // Update internal state when currentImageUrl changes (e.g., when editing)
  useEffect(() => {
    const partialUrl = toPartialUrl(currentImageUrl || null)
    if (partialUrl !== uploadedPartialUrl) {
      isSyncingFromExternalRef.current = true
      setUploadedPartialUrl(partialUrl)
    }
  }, [currentImageUrl, uploadedPartialUrl])

  // Notify parent of partial URL changes
  useEffect(() => {
    if (isSyncingFromExternalRef.current) {
      isSyncingFromExternalRef.current = false
      return
    }
    if (!hasUserInteractionRef.current) {
      return
    }
    onPartialUrlChange?.(uploadedPartialUrl)
  }, [uploadedPartialUrl, onPartialUrlChange])

  // Convert partial URL to full URL for display
  const displayImageUrl = useMemo(() => {
    const partial = uploadedPartialUrl || normalizedCurrentUrl
    if (!partial) return previewUrl
    return toFullUrl(partial, state.URL)
  }, [uploadedPartialUrl, normalizedCurrentUrl, previewUrl])

  // Default upload function
  const defaultUploadFn = useCallback(
    async (file: File): Promise<ResponseApi<unknown>> => {
      if (!uploadUrl) {
        throw new Error('Upload URL is required when using default upload')
      }

      const httpClient = createHttpClient(idFuncionalidade)
      const formData = new FormData()
      formData.append(fieldName, file)

      // Add additional fields if provided
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      const response = await httpClient.postRequest<FormData, unknown>(
        state.URL,
        uploadUrl,
        formData
      )

      return response
    },
    [uploadUrl, fieldName, additionalFields, idFuncionalidade]
  )

  // Handle file upload with retry mechanism
  const handleUpload = useCallback(
    async (file: File, retryAttempt = 0): Promise<void> => {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)
      setRetryCount(retryAttempt)

      try {
        // Compress image if enabled
        let fileToUpload = file
        if (enableCompression) {
          setIsCompressing(true)
          try {
            // Preserve PNG format for PNG files to maintain transparency
            const isPng = file.type === 'image/png'
            const compressionOpts: CompressionOptions = {
              maxWidth: maxWidth || 1920,
              maxHeight: maxHeight || 1920,
              quality: 0.8,
              outputFormat: isPng ? 'image/png' : 'image/jpeg',
              maxSizeBytes: maxSize,
              ...compressionOptions,
            }
            fileToUpload = await compressImage(file, compressionOpts)
            setIsCompressing(false)
          } catch (compressError) {
            setIsCompressing(false)
            console.warn(
              'Compression failed, using original file:',
              compressError
            )
            // Continue with original file if compression fails
          }
        }

        // Simulate progress (since axios doesn't provide upload progress by default)
        progressIntervalRef.current = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
              }
              return 90
            }
            return prev + 10
          })
        }, 100)

        const uploadFn = customUploadFn || defaultUploadFn
        const response = await uploadFn(fileToUpload)

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        setUploadProgress(100)

        // Extract image URL from response if available
        let partialUrl: string | null = null
        if (response?.info) {
          const responseData = response.info as any
          // Try common response formats
          const imageUrl =
            responseData?.data?.url ||
            responseData?.data?.Url ||
            responseData?.data?.imageUrl ||
            responseData?.data?.fileUrl ||
            responseData?.url ||
            responseData?.Url ||
            responseData?.imageUrl ||
            responseData?.fileUrl

          if (imageUrl) {
            // ⚠️ CRITICAL: Convert to partial URL for storage
            partialUrl = toPartialUrl(imageUrl)
            hasUserInteractionRef.current = true
            setUploadedPartialUrl(partialUrl)
          } else {
            throw new Error('Resposta de upload sem URL da imagem.')
          }
        }

        // Reset retry count on success
        setRetryCount(0)
        toast.success('Imagem enviada com sucesso')
        // ⚠️ CRITICAL: Callback receives partial URL, not full URL
        onUploadSuccess?.(partialUrl, response.info)
      } catch (err) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao fazer upload da imagem'

        // Retry logic
        if (retryAttempt < maxRetries) {
          const delay = Math.pow(2, retryAttempt) * 1000 // Exponential backoff
          setError(
            `Tentativa ${retryAttempt + 1}/${maxRetries}. Tentando novamente...`
          )
          toast.warning(
            `Erro ao enviar. Tentativa ${retryAttempt + 1}/${maxRetries}`
          )

          setTimeout(() => {
            handleUpload(file, retryAttempt + 1)
          }, delay)
          return
        }

        // Max retries reached
        setError(errorMessage)
        toast.error(errorMessage)
        onUploadError?.(err instanceof Error ? err : new Error(errorMessage))
        setRetryCount(0)
      } finally {
        setIsUploading(false)
        setIsCompressing(false)
        setUploadProgress(0)
      }
    },
    [
      customUploadFn,
      defaultUploadFn,
      onUploadSuccess,
      onUploadError,
      enableCompression,
      compressionOptions,
      maxWidth,
      maxHeight,
      maxSize,
      maxRetries,
    ]
  )

  // Handle file drop/selection
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      hasUserInteractionRef.current = true

      // Validate file size
      if (file.size > maxSize) {
        const errorMsg = `Arquivo muito grande. Tamanho máximo: ${(
          maxSize /
          (1024 * 1024)
        ).toFixed(2)}MB`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = `Formato não suportado. Use: ${supportedTypesLabel}`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      setSelectedFile(file)
      setError(null)
      setRetryCount(0)

      // Get image metadata
      try {
        const metadata = await getImageMetadata(file)
        setImageMetadata(metadata)

        // Validate dimensions if specified
        if (minWidth && metadata.width < minWidth) {
          const errorMsg = `Largura mínima: ${minWidth}px (atual: ${metadata.width}px)`
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }

        if (minHeight && metadata.height < minHeight) {
          const errorMsg = `Altura mínima: ${minHeight}px (atual: ${metadata.height}px)`
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }

        if (maxWidth && metadata.width > maxWidth) {
          toast.custom({
            description: `Imagem será redimensionada de ${metadata.width}x${metadata.height}px para máximo ${maxWidth}x${maxHeight || maxWidth}px`,
            variant: 'default',
          })
        }

        if (maxHeight && metadata.height > maxHeight) {
          toast.custom({
            description: `Imagem será redimensionada de ${metadata.width}x${metadata.height}px para máximo ${maxWidth || maxHeight}x${maxHeight}px`,
            variant: 'default',
          })
        }
      } catch (metadataError) {
        console.warn('Failed to get image metadata:', metadataError)
        // Continue even if metadata extraction fails
      }

      // Cleanup previous preview URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      objectUrlRef.current = objectUrl
      setPreviewUrl(objectUrl)

      // Auto upload if enabled
      if (autoUpload) {
        handleUpload(file)
      }
    },
    [
      maxSize,
      autoUpload,
      handleUpload,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    ]
  )

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => {
      const errorMsg = `Tipo de ficheiro não suportado. Formatos aceites: ${supportedTypesLabel}`
      setError(errorMsg)
      toast.error(errorMsg)
    },
    accept: accept as Accept,
    maxFiles: 1,
    disabled: disabled || isUploading,
    multiple: false,
  })

  // Cleanup preview URL and intervals on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [])

  // Variant styles - portrait orientation with fixed height and constrained width
  const variantStyles = {
    default: 'h-64 aspect-[3/4] max-w-[192px]',
    // Mais compacto para aproximar o GSFormUpload (Foto/Assinatura do médico)
    compact: 'h-28 max-w-[140px]',
    large: 'h-80 aspect-[3/4] max-w-[240px]',
  }

  // Use previewUrl if available (file selected but not uploaded), otherwise use uploaded image
  const displayImage = previewUrl || displayImageUrl

  // Get the width constraint from variant styles for consistent sizing
  const widthConstraint =
    variant === 'compact'
      ? 'w-[140px]'
      : variant === 'default'
        ? 'w-[192px]'
        : 'w-[240px]'

  return (
    <div className={cn('w-fit', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-md transition-all cursor-pointer overflow-hidden',
          'bg-background/50 backdrop-blur-sm',
          'border-border hover:border-primary/60 hover:bg-accent/30',
          'hover:shadow-md hover:shadow-primary/5',
          isDragActive &&
            'border-primary bg-primary/5 shadow-lg shadow-primary/10',
          disabled && 'cursor-not-allowed opacity-50',
          isUploading && 'cursor-wait',
          variantStyles[variant],
          widthConstraint,
          rootClassName,
          'max-h-full'
        )}
      >
        <input {...getInputProps()} />

        {displayImage && showPreview ? (
          <div className='relative w-full h-full group overflow-hidden rounded-xl flex items-center justify-center bg-background/30'>
            <img
              src={displayImage}
              alt='Preview'
              className='w-full h-full object-contain'
              style={{
                objectPosition: 'center center',
              }}
              onError={() => {
                setError('Erro ao carregar preview da imagem')
              }}
            />
            {!disabled && !isUploading && (
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-2 right-2 shadow-lg z-10 bg-destructive/90 hover:bg-destructive'
                onClick={(e) => {
                  e.stopPropagation()
                  if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current)
                    objectUrlRef.current = null
                  }
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  hasUserInteractionRef.current = true
                  setUploadedPartialUrl(null)
                  setError(null)
                  setImageMetadata(null)
                  setRetryCount(0)
                  // Notify parent that image was removed
                  onUploadSuccess?.(null)
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
            {/* Image Metadata Overlay */}
            {showMetadata && imageMetadata && !isUploading && (
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent text-white text-xs p-2.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5'>
                    <Info className='h-3.5 w-3.5' />
                    <span className='font-medium'>
                      {imageMetadata.width} × {imageMetadata.height}px
                    </span>
                  </div>
                  <span className='font-medium'>
                    {formatFileSize(imageMetadata.size)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full p-2'>
            {isUploading || isCompressing ? (
              <div className='flex flex-col items-center gap-1.5'>
                <Loader2 className='h-5 w-5 animate-spin text-primary' />
                <p className='text-[10px] text-muted-foreground text-center'>
                  {isCompressing
                    ? 'Comprimindo...'
                    : retryCount > 0
                      ? `Tentativa ${retryCount}/${maxRetries}`
                      : 'Enviando...'}
                </p>
              </div>
            ) : (
              <>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mb-1.5'>
                  {placeholderIcon ?? <ImageIcon className='h-4 w-4 text-primary' />}
                </div>
                {placeholder ? (
                  <p className='text-[10px] font-medium text-center mb-1 text-foreground px-1.5 leading-tight'>
                    {placeholder}
                  </p>
                ) : null}
                {actionButtonLabel ? (
                  <div className='flex items-center justify-center gap-2 mt-1'>
                    <Button
                      type='button'
                      variant='default'
                      size='sm'
                      className={cn('h-7 text-[11px] px-2', actionButtonClassName)}
                    >
                      <Upload className='h-3.5 w-3.5' />
                      {actionButtonShowLabel ? (
                        <span className='ml-1'>{actionButtonLabel}</span>
                      ) : null}
                    </Button>
                    {showRemoveButtonAlways ? (
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='h-7 w-7'
                        title='Remover'
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          hasUserInteractionRef.current = true
                          setUploadedPartialUrl(null)
                          setError(null)
                          setImageMetadata(null)
                          setRetryCount(0)
                          onUploadSuccess?.(null)
                        }}
                      >
                        <X className='h-3.5 w-3.5' />
                      </Button>
                    ) : null}
                  </div>
                ) : showRemoveButtonAlways ? (
                  <Button
                    type='button'
                    variant='destructive'
                    size='icon'
                    className='h-7 w-7 mt-1'
                    title='Remover'
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      hasUserInteractionRef.current = true
                      setUploadedPartialUrl(null)
                      setError(null)
                      setImageMetadata(null)
                      setRetryCount(0)
                      onUploadSuccess?.(null)
                    }}
                  >
                    <X className='h-3.5 w-3.5' />
                  </Button>
                ) : null}
                {showFileTypesHint ? (
                  <p className='text-[9px] text-muted-foreground text-center leading-tight mt-1'>
                    {supportedTypesLabel} • {maxSize / (1024 * 1024)}MB
                  </p>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Enviando...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='flex items-center justify-between gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm'>
          <div className='flex items-center gap-2'>
            <X className='h-4 w-4' />
            <span>{error}</span>
          </div>
          {retryCount > 0 && retryCount < maxRetries && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                if (selectedFile) {
                  handleUpload(selectedFile, 0)
                }
              }}
              className='h-6 px-2 text-xs'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Tentar novamente
            </Button>
          )}
        </div>
      )}

      {/* Manual Upload Button (when autoUpload is false) */}
      {selectedFile && !autoUpload && !isUploading && (
        <Button
          type='button'
          onClick={() => handleUpload(selectedFile)}
          disabled={disabled || isUploading}
          className='w-full'
        >
          <Upload className='h-4 w-4 mr-2' />
          Enviar Imagem
        </Button>
      )}
    </div>
  )
}
