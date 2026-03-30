/**
 * Environment utility functions
 */

/**
 * Checks if the application is running in production mode
 * @returns true if running in production, false otherwise
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true
}

/**
 * Checks if the application is running in development mode
 * @returns true if running in development, false otherwise
 */
export function isDevelopment(): boolean {
  return !isProduction()
}
