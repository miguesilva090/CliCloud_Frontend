import axios, { type AxiosResponse, type AxiosError } from 'axios'
import state from '@/states/state'
import { ResponseApi } from '@/types/responses'
import { ResponseStatus } from '@/types/api/responses'
import { mergeUserInfoIntoAuth, useAuthStore } from '@/stores/auth-store'
import { useConnectionStatusStore } from '@/stores/connection-status-store'
import { BaseApiError } from '@/lib/base-client'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
import { toast } from '@/utils/toast-utils'

export class HttpClient {
  private idFuncionalidade?: string
  private get apiKey(): string {
    return getRuntimeConfig().apiKey || ''
  }
  private tokenCheckInProgress = false
  private lastTokenCheck = 0
  private readonly TOKEN_CHECK_INTERVAL = 30000 // 30 seconds

  constructor(idFuncionalidade?: string) {
    this.idFuncionalidade = idFuncionalidade
  }

  private async renewToken(): Promise<boolean> {
    const currentTime = Date.now()

    if (
      this.tokenCheckInProgress ||
      currentTime - this.lastTokenCheck < this.TOKEN_CHECK_INTERVAL
    ) {
      return true
    }

    try {
      this.tokenCheckInProgress = true
      const { token, expiryTime } = useAuthStore.getState()

      if (!token) {
        return false
      }

      const tokenExpiryTime = new Date(expiryTime).getTime()

      if (tokenExpiryTime < currentTime) {
        const { authService } = await import('@/lib/services/auth/auth.service')
        const response = await authService.refreshToken()

        if (response.status === ResponseStatus.Success && response.data) {
          const authStore = useAuthStore.getState()
          authStore.setToken(response.data.token)
          authStore.setRefreshToken(response.data.refreshToken)
          authStore.setExpiryTime(response.data.expiryTime)
          mergeUserInfoIntoAuth(response.data.user)

          console.log('🔑 Token successfully refreshed')
          return true
        }

        return false
      }

      return true
    } finally {
      this.lastTokenCheck = currentTime
      this.tokenCheckInProgress = false
    }
  }

  private async withTokenRenewal<T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    const tokenValid = await this.renewToken()

    if (!tokenValid) {
      throw new Error('Unable to renew token')
    }

    return requestFn()
  }

  protected getHeaders(data?: unknown) {
    const { token, clientId } = useAuthStore.getState()

    const headers: Record<string, string> = {
      tenant: 'root',
      'Accept-Language': 'en-US',
      Authorization: `Bearer ${token}`,
      'X-API-Key': this.apiKey,
    }
    if (clientId) {
      headers['X-Client-Id'] = clientId 
    }

    // Only set Content-Type for non-FormData requests
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.idFuncionalidade) {
      headers['X-Funcionalidade-Id'] = this.idFuncionalidade
    }

    return headers
  }

  public getRequest = async <T>(
    baseUrl: string,
    url: string
  ): Promise<ResponseApi<T>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.get(`${baseUrl}${url}`, {
          headers: this.getHeaders(),
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public postRequest = async <T, U>(
    baseUrl: string,
    url: string,
    data: T
  ): Promise<ResponseApi<U>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.post(`${baseUrl}${url}`, data, {
          headers: this.getHeaders(data),
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  // Similarly update other methods (putRequest, deleteRequest, etc.)
  public putRequest = async <T, U>(
    baseUrl: string,
    url: string,
    data: T
  ): Promise<ResponseApi<U>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.put(`${baseUrl}${url}`, data, {
          headers: this.getHeaders(),
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public deleteRequest = async <T>(
    baseUrl: string,
    url: string
  ): Promise<ResponseApi<T>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.delete(`${baseUrl}${url}`, {
          headers: this.getHeaders(),
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public postWithoutDataRequest = async <T>(
    baseUrl: string,
    url: string
  ): Promise<ResponseApi<T>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.post(
          `${baseUrl}${url}`,
          {},
          {
            headers: this.getHeaders(),
          }
        )
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public putWithoutDataRequest = async <T>(
    baseUrl: string,
    url: string
  ): Promise<ResponseApi<T>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.put(
          `${baseUrl}${url}`,
          {},
          {
            headers: this.getHeaders(),
          }
        )
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public getRequestWithoutAuth = async <T>(
    baseUrl: string,
    url: string
  ): Promise<ResponseApi<T>> => {
    try {
      const response = await axios.get(`${baseUrl}${url}`, {
        headers: {
          tenant: 'root',
          'Accept-Language': 'en-US',
        },
      })

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public postRequestWithoutAuth = async <T, U>(
    baseUrl: string,
    url: string,
    data: T
  ): Promise<ResponseApi<U>> => {
    try {
      const response = await axios.post(`${baseUrl}${url}`, data, {
        headers: {
          tenant: 'root',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      })

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public deleteRequestWithBody = async <TBody, TResponse>(
    baseUrl: string,
    url: string,
    body: TBody
  ): Promise<ResponseApi<TResponse>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.delete(`${baseUrl}${url}`, {
          headers: this.getHeaders(),
          data: body,
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  public patchRequest = async <T, U>(
    baseUrl: string,
    url: string,
    data: T
  ): Promise<ResponseApi<U>> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.patch(`${baseUrl}${url}`, data, {
          headers: this.getHeaders(),
        })
      )

      // Connection successful - update status
      updateConnectionStatus(baseUrl, false)

      return {
        info: response.data,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }

  // POST que devolve um Blob (para downloads de ficheiros, como PDFs)
  public postBlob = async <T>(
    baseUrl: string,
    url: string,
    data: T
  ): Promise<Blob> => {
    try {
      const response = await this.withTokenRenewal(() =>
        axios.post(`${baseUrl}${url}`, data, {
          headers: this.getHeaders(data),
          responseType: 'blob',
        })
      )

      updateConnectionStatus(baseUrl, false)
      return response.data as Blob
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) throw handleErrorAxios(error, baseUrl)
      else throw handleError(error, baseUrl)
    }
  }
}

// Factory function to create HttpClient instances
export const createHttpClient = (idFuncionalidade?: string) => {
  return new HttpClient(idFuncionalidade)
}

/**
 * Determines if the error indicates the API is down
 */
function isApiDownError(error: AxiosError): boolean {
  // Network errors (no response from server)
  if (!error.response) {
    // Check for specific network error codes
    const networkErrorCodes = [
      'ERR_NETWORK',
      'ERR_FAILED',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNABORTED',
    ]

    if (error.code && networkErrorCodes.includes(error.code)) {
      return true
    }

    // Check for network error messages
    const networkErrorMessages = [
      'Network Error',
      'network error',
      'Failed to fetch',
      'CORS',
      'cors',
      'Connection refused',
      'connection refused',
      'timeout',
      'Timeout',
    ]

    const errorMessage = error.message?.toLowerCase() || ''
    if (
      networkErrorMessages.some((msg) =>
        errorMessage.includes(msg.toLowerCase())
      )
    ) {
      return true
    }

    // If no response and it's a network-related error
    if (error.request && !error.response) {
      return true
    }
  }

  // Check for CORS errors (usually status 0 or no status)
  if (
    error.response?.status === 0 ||
    (!error.response?.status && error.request)
  ) {
    return true
  }

  return false
}

/**
 * Determines which API is down based on the error's request URL
 */
function getApiName(baseUrl: string): string {
  const accessControlUrl = state.URL_ACCESS_CONTROL.toLowerCase()
  const clientApiUrl = state.URL.toLowerCase()
  const errorUrl = baseUrl.toLowerCase()

  if (
    errorUrl.includes(accessControlUrl) ||
    errorUrl.includes('access-control') ||
    errorUrl.includes('licenses')
  ) {
    return 'API de Licenças'
  }

  if (errorUrl.includes(clientApiUrl) || errorUrl.includes('/client/')) {
    return 'API do Cliente'
  }

  return 'API'
}

// Track last notification time per API to prevent duplicate toasts
const lastApiDownNotification = new Map<string, number>()
const NOTIFICATION_COOLDOWN = 10000 // 10 seconds

/**
 * Updates connection status in the store
 */
function updateConnectionStatus(baseUrl: string, isDown: boolean): void {
  const apiName = getApiName(baseUrl)
  const connectionStore = useConnectionStatusStore.getState()

  if (apiName === 'API do Cliente') {
    connectionStore.setClientApiStatus(isDown)
  } else if (apiName === 'API de Licenças') {
    connectionStore.setLicensesApiStatus(isDown)
  }
}

/**
 * Shows a user-friendly toast notification when API is down
 * Uses debouncing to prevent showing the same toast multiple times
 */
function notifyApiDown(error: AxiosError, baseUrl: string): void {
  if (!isApiDownError(error)) {
    return
  }

  const apiName = getApiName(baseUrl)
  const now = Date.now()
  const lastNotification = lastApiDownNotification.get(apiName) || 0

  // Only show toast if it hasn't been shown in the last cooldown period
  if (now - lastNotification < NOTIFICATION_COOLDOWN) {
    return
  }

  // Update last notification time
  lastApiDownNotification.set(apiName, now)

  // Update connection status
  updateConnectionStatus(baseUrl, true)

  toast.error(
    `Não foi possível conectar à ${apiName}. Por favor, verifique se o servidor está em execução e tente novamente.`,
    `${apiName} Indisponível`
  )
}

// Error handling function for Axios errors
function handleErrorAxios(error: AxiosError, baseUrl?: string): never {
  if (axios.isAxiosError(error)) {
    // Extract baseUrl from error if not provided
    let apiBaseUrl = baseUrl || ''
    if (!apiBaseUrl && error.config?.url) {
      // Try to extract base URL from the full URL
      try {
        const fullUrl = error.config.url.startsWith('http')
          ? error.config.url
          : `${error.config.baseURL || ''}${error.config.url}`
        const urlObj = new URL(fullUrl)
        apiBaseUrl = `${urlObj.protocol}//${urlObj.host}`
      } catch {
        // If URL parsing fails, try to get from request
        if (error.request?.responseURL) {
          try {
            const urlObj = new URL(error.request.responseURL)
            apiBaseUrl = `${urlObj.protocol}//${urlObj.host}`
          } catch {
            // Fallback to state URLs
            apiBaseUrl = state.URL
          }
        } else {
          apiBaseUrl = state.URL
        }
      }
    } else if (!apiBaseUrl) {
      apiBaseUrl = state.URL
    }

    // Check if API is down and notify user
    if (isApiDownError(error)) {
      notifyApiDown(error, apiBaseUrl)
    }

    // Handle validation errors (API is up but returned validation errors)
    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'status' in error.response.data &&
      'messages' in error.response.data
    ) {
      throw new BaseApiError(
        'Validation Error',
        error.response.status,
        error.response.data
      )
    }

    // Trigger global clinic selection flow when backend indicates missing clinic mapping
    const errorBody = error.response?.data
    const bodyText =
      typeof errorBody === 'string'
        ? errorBody
        : typeof errorBody === 'object' && errorBody !== null && 'messages' in errorBody
          ? JSON.stringify(errorBody)
          : ''

    if (
      bodyText.toLowerCase().includes('sem clínica associada') ||
      bodyText.toLowerCase().includes('sem clinica associada')
    ) {
      window.dispatchEvent(new CustomEvent('clinica-selection-required'))
    }

    // Qualquer outro 4xx/5xx: passar o body para o cliente poder mostrar a mensagem (ex.: BadRequest(ex.Message) devolve string)
    const body = errorBody
    throw new BaseApiError(
      error.message,
      error.response?.status,
      body !== undefined ? body : undefined
    )
  }

  throw new BaseApiError('Unknown error', 500)
}

// General error handling function
function handleError(error: unknown, baseUrl?: string): never {
  if (axios.isAxiosError(error)) {
    return handleErrorAxios(error, baseUrl)
  }

  throw new BaseApiError('Unknown error', 500)
}
