/**
 * Runtime Configuration System
 *
 * This module provides runtime configuration loading from a JSON file,
 * allowing a single build to work with multiple clients by replacing
 * the config.json file per deployment.
 *
 * Security Note:
 * - All configuration values are visible in the client bundle
 * - API keys in frontend applications are always exposed to users
 * - Use this for client-specific URLs and non-sensitive configuration
 * - For sensitive secrets, use server-side authentication/authorization
 */

export interface RuntimeConfig {
  /**
   * API Key for authenticating with the backend API
   */
  apiKey: string

  /**
   * Base URL for the main API (HTTP)
   */
  urlApiHttp?: string

  /**
   * Base URL for the main API (HTTPS)
   */
  urlApiHttps?: string

  /**
   * Base URL for Access Control API (HTTP)
   */
  urlAccessControlHttp?: string

  /**
   * Base URL for Access Control API (HTTPS)
   */
  urlAccessControlHttps?: string

  /**
   * Base URL for Updater API (HTTP)
   */
  updaterApiUrlHttp?: string

  /**
   * Base URL for Updater API (HTTPS)
   */
  updaterApiUrlHttps?: string

  /**
   * API Key for the Updater service
   */
  updaterApiKey?: string

  /**
   * Client Key identifier
   */
  clientKey?: string

  /**
   * License ID
   */
  licencaId?: string

  /**
   * Encryption key for localStorage encryption
   * Optional - if not provided, falls back to VITE_ENCRYPTION_KEY or default key
   * Can be set via config.json for client-specific encryption keys without rebuilding
   */
  encryptionKey?: string
}

/**
 * Default configuration loaded from environment variables (for development)
 */
function getDefaultConfig(): RuntimeConfig {
  return {
    apiKey: import.meta.env.VITE_API_KEY || '',
    urlApiHttp: import.meta.env.VITE_URL_API_HTTP || '',
    urlApiHttps: import.meta.env.VITE_URL_API_HTTPS || '',
    urlAccessControlHttp: import.meta.env.VITE_URL_ACCESS_CONTROL_HTTP || '',
    urlAccessControlHttps: import.meta.env.VITE_URL_ACCESS_CONTROL_HTTPS || '',
    updaterApiUrlHttp: import.meta.env.VITE_UPDATER_API_URL_HTTP || '',
    updaterApiUrlHttps: import.meta.env.VITE_UPDATER_API_URL_HTTPS || '',
    updaterApiKey: import.meta.env.VITE_UPDATER_API_KEY || '',
    clientKey: import.meta.env.VITE_CLIENT_KEY || '',
    licencaId: import.meta.env.VITE_LICENCA_ID || '',
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
  }
}

let cachedConfig: RuntimeConfig | null = null
let configLoadPromise: Promise<RuntimeConfig> | null = null

/**
 * Loads the runtime configuration from config.json
 * Falls back to environment variables if config.json is not available
 *
 * @returns Promise that resolves to the runtime configuration
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig
  }

  // Return existing promise if load is in progress
  if (configLoadPromise) {
    return configLoadPromise
  }

  // Start loading config
  configLoadPromise = (async () => {
    // In development mode, always use environment variables
    // config.json should only be used in production builds
    const isDevelopment = import.meta.env.DEV

    if (isDevelopment) {
      const defaultConfig = getDefaultConfig()
      cachedConfig = defaultConfig
      console.log(
        '[RuntimeConfig] Development mode: using environment variables'
      )
      return defaultConfig
    }

    // In production, try to load from config.json
    try {
      const response = await fetch('/config.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const config = (await response.json()) as RuntimeConfig
        cachedConfig = config
        console.log('[RuntimeConfig] Loaded configuration from config.json')

        // Clear encryption key cache when config is reloaded
        // This ensures the new encryption key from config.json is used
        if (typeof window !== 'undefined') {
          // Dynamically import to avoid circular dependency
          import('../utils/encryption-key').then(
            ({ clearEncryptionKeyCache }) => {
              clearEncryptionKeyCache()
            }
          )
        }

        return config
      } else {
        console.warn(
          '[RuntimeConfig] config.json not found or not accessible, falling back to environment variables'
        )
      }
    } catch (error) {
      console.warn(
        '[RuntimeConfig] Failed to load config.json, falling back to environment variables:',
        error
      )
    }

    // Fallback to environment variables
    const defaultConfig = getDefaultConfig()
    cachedConfig = defaultConfig
    return defaultConfig
  })()

  return configLoadPromise
}

/**
 * Gets the current runtime configuration
 * If not loaded yet, returns default config from environment variables
 *
 * @returns Current runtime configuration
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (cachedConfig) {
    return cachedConfig
  }
  return getDefaultConfig()
}

/**
 * Clears the cached configuration (useful for testing or hot-reloading)
 */
export function clearRuntimeConfigCache(): void {
  cachedConfig = null
  configLoadPromise = null
}

/**
 * Initialize runtime config on app startup
 * Call this early in your app initialization
 */
export async function initRuntimeConfig(): Promise<void> {
  await loadRuntimeConfig()
}
