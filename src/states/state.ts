import { GSResponseToken } from '@/types/api/responses'
import { DynamicPermissionDTO } from '@/types/dtos/common/permissions.dtos'
import { jwtDecode } from 'jwt-decode'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
import { decryptData, encryptData } from '@/lib/utils/crypto'
import { getApiUrl } from '@/utils/url-normalizer'

interface StateStorage {
  Token: string
  Refresh_Token: string
  expiryTime: string
  Email: string
  ClienteId: string
  p: string // permissions
  m: string // modules
}

class State {
  private static instance: State

  // Core properties
  public Token = ''
  public Refresh_Token = ''
  public expiryTime = ''
  public Email = ''
  public get ApiKey(): string {
    return getRuntimeConfig().apiKey || ''
  }

  /**
   * Gets the API URL based on current page protocol (HTTP/HTTPS)
   *
   * Uses separate environment variables:
   * - VITE_URL_API_HTTP for HTTP environments
   * - VITE_URL_API_HTTPS for HTTPS environments
   */
  public get URL(): string {
    return getApiUrl('VITE_URL_API')
  }

  /**
   * Gets the Access Control API URL based on current page protocol (HTTP/HTTPS)
   *
   * Uses separate environment variables:
   * - VITE_URL_ACCESS_CONTROL_HTTP for HTTP environments
   * - VITE_URL_ACCESS_CONTROL_HTTPS for HTTPS environments
   */
  public get URL_ACCESS_CONTROL(): string {
    return getApiUrl('VITE_URL_ACCESS_CONTROL')
  }

  // User properties
  public Nome = ''
  public UserId = ''
  public ClienteId = ''
  public RoleId = ''
  public Permissoes: DynamicPermissionDTO = {}
  public Modules: string[] = []

  public isLoaded = false

  // Implement Singleton pattern
  public static getInstance(): State {
    if (!State.instance) {
      State.instance = new State()
    }
    return State.instance
  }

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Helper function to get items from localStorage with type safety
  private getFromLocalStorage<T extends keyof StateStorage>(
    key: T,
    defaultValue = ''
  ): string {
    try {
      const value = localStorage.getItem(key)
      if (!value) return defaultValue
      return decryptData(value) || defaultValue
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Helper function to set items to localStorage with type safety
  private setToLocalStorage<T extends keyof StateStorage>(
    key: T,
    value: string
  ): void {
    try {
      localStorage.setItem(key, encryptData(value))
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
    }
  }

  // Helper function to remove items from localStorage with type safety
  private removeFromLocalStorage<T extends keyof StateStorage>(key: T): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }

  // Decodes the JWT and sets the relevant state properties
  public decodeJwt(): void {
    if (!this.Token) {
      console.warn('No token available to decode')
      return
    }

    try {
      const decodedToken: GSResponseToken = jwtDecode<GSResponseToken>(
        this.Token
      )
      const email = decodedToken.email || ''
      const rolesRaw = decodedToken.roles
      const role = Array.isArray(rolesRaw) ? rolesRaw[0] : rolesRaw

      this.Nome = email?.split('@')[0] || decodedToken.sub || ''
      this.UserId = decodedToken.uid || decodedToken.sub || ''
      this.RoleId = (role || '').toString().toLowerCase()
    } catch (err) {
      console.error('Failed to decode JWT:', err)
      this.clearUserData()
    }
  }

  // Loads state from localStorage
  public load(): void {
    try {
      this.Token = this.getFromLocalStorage('Token')
      this.Refresh_Token = this.getFromLocalStorage('Refresh_Token')
      this.expiryTime = this.getFromLocalStorage('expiryTime')
      this.Email = this.getFromLocalStorage('Email')
      this.ClienteId = this.getFromLocalStorage('ClienteId')

      const permissionsStr = this.getFromLocalStorage('p')
      this.Permissoes = permissionsStr ? JSON.parse(permissionsStr) : {}

      const modulesStr = this.getFromLocalStorage('m')
      this.Modules = modulesStr ? JSON.parse(modulesStr) : []

      if (this.Token) {
        this.decodeJwt()
      }

      this.isLoaded = true
      console.log('State loaded successfully')
    } catch (error) {
      console.error('Error loading state:', error)
      this.clear()
    }
  }

  // Saves the current state to localStorage
  public save(): void {
    try {
      this.setToLocalStorage('Token', this.Token)
      this.setToLocalStorage('Refresh_Token', this.Refresh_Token)
      this.setToLocalStorage('expiryTime', this.expiryTime)
      this.setToLocalStorage('Email', this.Email)
      this.setToLocalStorage('ClienteId', this.ClienteId)
      this.setToLocalStorage('p', JSON.stringify(this.Permissoes))
      this.setToLocalStorage('m', JSON.stringify(this.Modules))

      console.log('State saved successfully')
    } catch (error) {
      console.error('Error saving state:', error)
    }
  }

  // Clear user-specific data
  private clearUserData(): void {
    this.Nome = ''
    this.UserId = ''
    this.RoleId = ''
    this.Permissoes = {}
  }

  // Clears all state and localStorage
  public clear(): void {
    // Clear state properties
    this.Token = ''
    this.Refresh_Token = ''
    this.expiryTime = ''
    this.Email = ''
    this.ClienteId = ''
    this.clearUserData()

    // Clear localStorage
    this.removeFromLocalStorage('Token')
    this.removeFromLocalStorage('Refresh_Token')
    this.removeFromLocalStorage('expiryTime')
    this.removeFromLocalStorage('Email')
    this.removeFromLocalStorage('ClienteId')
    this.removeFromLocalStorage('p')
    this.removeFromLocalStorage('m')

    console.log('State and localStorage cleared')
  }

  // Public method to get token from localStorage
  public getStoredToken(): string {
    return this.getFromLocalStorage('Token')
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return Boolean(this.Token && this.UserId)
  }
}

// Export singleton instance
export default State.getInstance()
