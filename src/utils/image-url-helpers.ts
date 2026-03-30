/**
 * Image URL Helper Functions
 *
 * Handles conversion between partial URLs (for storage) and full URLs (for display)
 *
 * IMPORTANT:
 * - Database stores PARTIAL URLs (e.g., "/assets/imagens/entity/abc123.jpg")
 * - API returns FULL URLs in GET responses (e.g., "https://api.example.com/assets/imagens/entity/abc123.jpg")
 * - API expects PARTIAL URLs in POST/PUT requests
 */

/**
 * Converts a full URL to a partial URL (path only)
 * If the URL is already partial, returns it as-is
 *
 * @param url - Full URL or partial URL
 * @returns Partial URL (path starting with /) or null
 */
export function toPartialUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // If already partial (starts with /), return as-is
  if (url.startsWith('/')) {
    return url
  }

  // If full URL, extract the path portion
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch {
    // Fallback: try to extract path manually
    const protocolIndex = url.indexOf('://')
    if (protocolIndex > 0) {
      const pathStart = url.indexOf('/', protocolIndex + 3)
      if (pathStart > 0) {
        const queryIndex = url.indexOf('?', pathStart)
        const hashIndex = url.indexOf('#', pathStart)
        const endIndex =
          queryIndex > 0 ? queryIndex : hashIndex > 0 ? hashIndex : url.length
        return url.substring(pathStart, endIndex)
      }
    }
    // If extraction fails, return as-is (might already be partial)
    return url
  }
}

/**
 * Converts a partial URL to a full URL for display
 * If the URL is already full, returns it as-is
 *
 * @param partialUrl - Partial URL (path starting with /)
 * @param baseUrl - API base URL (from environment/config)
 * @returns Full URL for image display or null
 */
export function toFullUrl(
  partialUrl: string | null | undefined,
  baseUrl: string
): string | null {
  if (!partialUrl) return null

  // If already a full URL, return as-is
  if (partialUrl.startsWith('http://') || partialUrl.startsWith('https://')) {
    return partialUrl
  }

  // Ensure partial URL starts with /
  const path = partialUrl.startsWith('/') ? partialUrl : `/${partialUrl}`

  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  return `${cleanBaseUrl}${path}`
}
