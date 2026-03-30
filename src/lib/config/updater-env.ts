import { getApiUrl } from '@/utils/url-normalizer'

/**
 * Wrapper around environment variables for the Licenses API and Globalsoft.Updater.
 *
 * Even though this project uses Vite (VITE_* variables), this module centralizes
 * the URLs so they can conceptually match the documentation:
 * - REACT_APP_LICENSES_API_URL  -> VITE_URL_ACCESS_CONTROL*
 * - REACT_APP_UPDATER_API_URL   -> VITE_UPDATER_API_URL*
 */
export const updaterEnv = {
  /**
   * Base URL for Licenses API (ClientTokenService).
   * Backed by VITE_URL_ACCESS_CONTROL*_ variables.
   */
  get licensesApiUrl(): string {
    return getApiUrl('VITE_URL_ACCESS_CONTROL')
  },

  /**
   * Base URL for Globalsoft.Updater.
   * Backed by VITE_UPDATER_API_URL_HTTP and VITE_UPDATER_API_URL_HTTPS.
   */
  get updaterApiUrl(): string {
    return getApiUrl('VITE_UPDATER_API_URL')
  },
}
