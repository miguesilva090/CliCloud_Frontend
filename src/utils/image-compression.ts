/**
 * Image Compression Utility
 *
 * Provides functions to compress and resize images before upload
 * using native browser APIs (Canvas API)
 */

export interface CompressionOptions {
  /** Maximum width in pixels (maintains aspect ratio) */
  maxWidth?: number
  /** Maximum height in pixels (maintains aspect ratio) */
  maxHeight?: number
  /** Quality for JPEG (0.0 to 1.0, default: 0.8) */
  quality?: number
  /** Output format (default: 'image/jpeg') */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Maximum file size in bytes (will compress further if needed) */
  maxSizeBytes?: number
}

export interface ImageMetadata {
  width: number
  height: number
  size: number
  type: string
}

/**
 * Get image metadata without loading the full image
 */
export function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

/**
 * Compress and resize an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    outputFormat = 'image/jpeg',
    maxSizeBytes,
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // If output format is JPEG and original is PNG with transparency, fill with white background
        // Otherwise, preserve transparency for PNG output
        if (outputFormat === 'image/jpeg' && file.type === 'image/png') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
        }

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with compression
        canvas.toBlob(
          async (blob) => {
            URL.revokeObjectURL(objectUrl)

            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // If maxSizeBytes is specified and blob is still too large, compress further
            if (maxSizeBytes && blob.size > maxSizeBytes) {
              let currentQuality = quality
              let compressedBlob = blob

              // Try progressively lower quality until we meet the size requirement
              while (
                compressedBlob.size > maxSizeBytes &&
                currentQuality > 0.1
              ) {
                currentQuality = Math.max(0.1, currentQuality - 0.1)

                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = width
                tempCanvas.height = height
                const tempCtx = tempCanvas.getContext('2d')

                if (!tempCtx) break

                // If output format is JPEG and original is PNG with transparency, fill with white background
                if (
                  outputFormat === 'image/jpeg' &&
                  file.type === 'image/png'
                ) {
                  tempCtx.fillStyle = '#ffffff'
                  tempCtx.fillRect(0, 0, width, height)
                }

                tempCtx.drawImage(img, 0, 0, width, height)

                compressedBlob = await new Promise<Blob>((resolve) => {
                  tempCanvas.toBlob(
                    (blob) => resolve(blob || compressedBlob),
                    outputFormat,
                    currentQuality
                  )
                })

                // If we can't compress further, stop
                if (compressedBlob.size === blob.size) break
              }

              blob = compressedBlob
            }

            // Create new File object with compressed data
            const fileName = file.name.replace(/\.[^.]+$/, '')
            const extension = outputFormat === 'image/png' ? '.png' : '.jpg'
            const compressedFile = new File([blob], `${fileName}${extension}`, {
              type: outputFormat,
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          outputFormat,
          quality
        )
      } catch (error) {
        URL.revokeObjectURL(objectUrl)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
