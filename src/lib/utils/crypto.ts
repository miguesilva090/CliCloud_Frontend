import CryptoJS from 'crypto-js'
import { getEncryptionKey } from './encryption-key'

/**
 * Encrypts data using AES encryption
 *
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns The encrypted string
 */
export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    getEncryptionKey()
  ).toString()
}

/**
 * Decrypts data that was encrypted with encryptData
 * Tries multiple keys in case the encryption key changed (e.g., from build-time to config.json)
 *
 * @param encryptedData - The encrypted string to decrypt
 * @returns The decrypted data, or null if decryption fails with all keys
 */
export const decryptData = <T>(encryptedData: string): T | null => {
  // Get the current encryption key
  const currentKey = getEncryptionKey()

  // List of keys to try (in order of preference)
  const keysToTry = [
    currentKey, // Try current key first (from config.json or env)
    import.meta.env.VITE_ENCRYPTION_KEY || '', // Try build-time key
    '#*/e"911txhf[C!B%ogy11$>,J^HXb', // Try default fallback key
  ].filter((key) => key && key.trim() !== '') // Remove empty keys

  // Try each key until one works
  for (const key of keysToTry) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8)

      // Check if decryption was successful (non-empty result)
      if (decryptedString && decryptedString.trim() !== '') {
        const parsed = JSON.parse(decryptedString)

        // If we used a different key than the current one, log a warning
        if (key !== currentKey) {
          console.warn(
            '[Crypto] Decrypted data using a different key than current. ' +
              'This may indicate the encryption key changed. Consider clearing old encrypted data.'
          )
        }

        return parsed
      }
    } catch (error) {
      // Try next key
      continue
    }
  }

  // All keys failed
  console.error('Failed to decrypt data with all available keys')
  return null
}
