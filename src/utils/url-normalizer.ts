/**
 * URL Selector Utility
 *
 * Automatically selects the correct API URL based on the current page protocol (HTTP/HTTPS).
 * Uses separate environment variables for HTTP and HTTPS endpoints.
 *
 * Environment Variable Pattern:
 * - VITE_URL_API_HTTP = "http://api.example.com:8084"
 * - VITE_URL_API_HTTPS = "https://api.example.com:8094"
 */
import { getRuntimeConfig } from '@/lib/config/runtime-config'

/**
 * Gets the current page protocol
 *
 * @returns The current protocol (http: or https:)
 */
export function getCurrentProtocol(): string {
  if (typeof window === 'undefined') {
    // Fallback for SSR or non-browser environments
    return 'https:'
  }
  return window.location.protocol
}

/**
 * Selects the appropriate URL based on the current page protocol
 *
 * Uses separate HTTP/HTTPS URLs:
 * - VITE_URL_API_HTTP and VITE_URL_API_HTTPS
 *
 * @param httpUrl - URL for HTTP environment (from VITE_URL_API_HTTP)
 * @param httpsUrl - URL for HTTPS environment (from VITE_URL_API_HTTPS)
 * @returns The appropriate URL based on current protocol
 *
 * @example
 * // With separate URLs:
 * selectUrlByProtocol('http://api.example.com:8084', 'https://api.example.com:8094')
 * // If accessed via HTTPS, returns 'https://api.example.com:8094'
 * // If accessed via HTTP, returns 'http://api.example.com:8084'
 */
export function selectUrlByProtocol(
  httpUrl: string,
  httpsUrl?: string
): string {
  const currentProtocol = getCurrentProtocol()
  const isHttps = currentProtocol === 'https:'

  // If HTTPS URL is provided and we're on HTTPS, use it
  if (isHttps && httpsUrl) {
    return httpsUrl
  }

  // Otherwise use HTTP URL (or fallback to httpsUrl if httpUrl is empty)
  return httpUrl || httpsUrl || ''
}

/**
 * Gets the appropriate API URL from runtime configuration or environment variables
 *
 * Uses protocol-specific configuration (HTTP/HTTPS).
 *
 * @param baseName - Base name for the configuration (e.g., 'urlApi' or 'VITE_URL_API')
 * @returns The appropriate URL based on current protocol
 *
 * @example
 * // Runtime config:
 * // urlApiHttp = "http://api.example.com:8084"
 * // urlApiHttps = "https://api.example.com:8094"
 *
 * getApiUrl('urlApi')
 * // Returns the appropriate URL based on current protocol
 */
export function getApiUrl(baseName: string): string {
  const config = getRuntimeConfig()

  // Map base names (both old VITE_* format and new format) to config properties
  const configMap: Record<string, { http?: string; https?: string }> = {
    // New format
    urlApi: {
      http: config.urlApiHttp,
      https: config.urlApiHttps,
    },
    urlAccessControl: {
      http: config.urlAccessControlHttp,
      https: config.urlAccessControlHttps,
    },
    updaterApiUrl: {
      http: config.updaterApiUrlHttp,
      https: config.updaterApiUrlHttps,
    },
    // Old format (for backward compatibility)
    VITE_URL_API: {
      http: config.urlApiHttp,
      https: config.urlApiHttps,
    },
    VITE_URL_ACCESS_CONTROL: {
      http: config.urlAccessControlHttp,
      https: config.urlAccessControlHttps,
    },
    VITE_UPDATER_API_URL: {
      http: config.updaterApiUrlHttp,
      https: config.updaterApiUrlHttps,
    },
  }

  // Try runtime config first
  const configEntry = configMap[baseName]
  if (configEntry) {
    const httpUrl = configEntry.http || ''
    const httpsUrl = configEntry.https || ''
    if (httpUrl || httpsUrl) {
      return selectUrlByProtocol(httpUrl, httpsUrl)
    }
  }

  // Fallback to environment variables (for backward compatibility)
  const envHttpUrl = import.meta.env[`${baseName}_HTTP`] || ''
  const envHttpsUrl = import.meta.env[`${baseName}_HTTPS`] || ''

  return selectUrlByProtocol(envHttpUrl, envHttpsUrl)
}
