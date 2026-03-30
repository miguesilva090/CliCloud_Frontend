import state from '@/states/state'
import { LoginResponse, ResponseStatus } from '@/types/api/responses'
import { useAuthStore } from '@/stores/auth-store'
import { createHttpClient } from '@/lib/http-client'

interface LoginCredentials {
  email: string
  password: string
}

const httpClient = createHttpClient()

export const authService = {
  async login(credentials: LoginCredentials) {
    // Backend (CliCloud saúde) espera apenas email/password.
    const response = await httpClient.postRequestWithoutAuth<
      LoginCredentials,
      LoginResponse
    >(state.URL, '/api/client-token', credentials)

    return response.info
  },

  async refreshToken() {
    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      useAuthStore.getState().clearAuth()
      return {
        status: ResponseStatus.Failure,
        messages: { $: ['Refresh token em falta'] },
      } satisfies LoginResponse
    }

    try {
      const response = await httpClient.getRequest<LoginResponse>(
        state.URL,
        `/api/client-token/refresh/${refreshToken}`
      )

      if (response.info.status !== ResponseStatus.Success || !response.info.data) {
        useAuthStore.getState().clearAuth()
      }

      return response.info
    } catch (error) {
      useAuthStore.getState().clearAuth()
      return {
        status: ResponseStatus.Failure,
        messages: { $: ['Falha ao renovar token'] },
      } satisfies LoginResponse
    }
  },
}
