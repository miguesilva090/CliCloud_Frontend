/**
 * Encryption Key Utility
 *
 * Provides a centralized way to get the encryption key used throughout the application.
 * The key can be configured via environment variable or runtime config.
 *
 * Priority order:
 * 1. Runtime config encryptionKey (if available)
 * 2. VITE_ENCRYPTION_KEY environment variable
 * 3. Fallback to default key (for backward compatibility)
 */
import { getRuntimeConfig, loadRuntimeConfig } from '../config/runtime-config'

/**
 * Default encryption key (fallback for backward compatibility)
 * This ensures existing encrypted data can still be decrypted
 */
const DEFAULT_ENCRYPTION_KEY = '#*/e"911txhf[C!B%ogy11$>,J^HXb'

// Cache the encryption key once determined
let cachedEncryptionKey: string | null = null
let encryptionKeyPromise: Promise<string> | null = null

/**
 * Clears the encryption key cache
 * This should be called when config.json is reloaded to ensure the new key is used
 */
export function clearEncryptionKeyCache(): void {
  cachedEncryptionKey = null
  encryptionKeyPromise = null
}

/**
 * Gets the encryption key asynchronously, ensuring config.json is loaded first
 * This is the preferred method when you can await it
 *
 * @returns Promise that resolves to the encryption key
 */
export async function getEncryptionKeyAsync(): Promise<string> {
  // If we have a cached key, return it immediately
  if (cachedEncryptionKey !== null) {
    return cachedEncryptionKey
  }

  // If a promise is already in progress, return it
  if (encryptionKeyPromise) {
    return encryptionKeyPromise
  }

  // Start loading the config and determining the key
  encryptionKeyPromise = (async (): Promise<string> => {
    // Ensure config is loaded
    const config = await loadRuntimeConfig()

    // Determine the key based on priority
    if (config.encryptionKey && config.encryptionKey.trim() !== '') {
      const key = config.encryptionKey
      cachedEncryptionKey = key
      return key
    }

    // Fallback to environment variable
    const envKey = import.meta.env.VITE_ENCRYPTION_KEY
    if (envKey && envKey.trim() !== '') {
      cachedEncryptionKey = envKey
      return envKey
    }

    // Final fallback to default key
    cachedEncryptionKey = DEFAULT_ENCRYPTION_KEY
    return DEFAULT_ENCRYPTION_KEY
  })()

  return encryptionKeyPromise
}

/**
 * Gets the encryption key synchronously
 * Note: In production, this may return the build-time key if config.json hasn't loaded yet
 * For reliable behavior, use getEncryptionKeyAsync() instead
 *
 * @returns The encryption key to use
 */
export function getEncryptionKey(): string {
  // If we have a cached key, use it
  if (cachedEncryptionKey !== null) {
    return cachedEncryptionKey
  }

  // First, try runtime config (if available)
  try {
    const config = getRuntimeConfig()
    if (config.encryptionKey && config.encryptionKey.trim() !== '') {
      const key = config.encryptionKey
      cachedEncryptionKey = key
      return key
    }
  } catch (error) {
    // Runtime config might not be loaded yet, continue to next option
  }

  // Second, try environment variable (available at build time)
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY
  if (envKey && envKey.trim() !== '') {
    // Cache it for consistency
    cachedEncryptionKey = envKey
    return envKey
  }

  // Fallback to default key for backward compatibility
  // This ensures existing encrypted localStorage data can still be decrypted
  cachedEncryptionKey = DEFAULT_ENCRYPTION_KEY
  return DEFAULT_ENCRYPTION_KEY
}
