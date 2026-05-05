import { GSResponseToken, type TokenResponse } from '@/types/api/responses'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { persist, StorageValue } from 'zustand/middleware'
import { encryptData, decryptData } from '@/lib/utils/crypto'
import { getEncryptionKeyAsync } from '@/lib/utils/encryption-key'
import { secureStorage } from '@/utils/secure-storage'

interface AuthState {
  token: string
  refreshToken: string
  expiryTime: string
  email: string
  name: string
  userId: string
  roleId: string
  clientId: string
  licencaId: string
  perfilId: string
  perfilNome: string
  permissions: Record<string, number>
  modules: string[]
  isLoaded: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  setToken: (token: string) => void
  setRefreshToken: (token: string) => void
  setUser: (email: string) => void
  decodeToken: () => void
  clearAuth: () => void
  setExpiryTime: (expiryTime: string) => void
}

const initialState: AuthState = {
  token: '',
  refreshToken: '',
  expiryTime: '',
  email: '',
  name: '',
  userId: '',
  roleId: '',
  clientId: '',
  licencaId: '',
  perfilId: '',
  perfilNome: '',
  permissions: {},
  modules: [],
  isLoaded: false,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (token: string) => {
        set({ token, isAuthenticated: !!token, isLoaded: true })
        get().decodeToken()
      },

      setRefreshToken: (refreshToken: string) => {
        set({ refreshToken })
      },

      setUser: (email: string) => {
        set({ email })
      },

      setExpiryTime: (expiryTime: string) => {
        set({ expiryTime })
      },

      decodeToken: () => {
        const { token } = get()
        if (!token) {
          console.warn('No token available to decode')
          return
        }

        try {
          const decoded: GSResponseToken = jwtDecode(token)

          const rolesRaw = decoded.roles
          const roleId = Array.isArray(rolesRaw)
            ? rolesRaw[0] || ''
            : rolesRaw || ''

          const email = decoded.email || ''
          const fallbackName =
            email?.split('@')?.[0] || decoded.sub || decoded.uid || ''
          const name =
            decoded.firstName || decoded.lastName
              ? `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim()
              : fallbackName

          set({
            email,
            name,
            userId: decoded.uid || decoded.sub || '',
            roleId,
            // Instância clínica: JWT CliCloud (`clinica_id`) ou GSLP (`clienteId` na claim / `client_id`).
            clientId:
              decoded.clinica_id ||
              decoded.client_id ||
              decoded.clienteId ||
              '',
            licencaId: decoded.license_id || '',
            perfilId: decoded.perfilId || decoded.profile_id || '',
            perfilNome: decoded.perfilNome || decoded.profile_name || '',
            isLoaded: true,
          })
        } catch (err) {
          console.error('Failed to decode JWT:', err)
          get().clearAuth()
        }
      },

      clearAuth: () => {
        try {
          // First remove the auth storage
          secureStorage.remove('auth-storage')
          // Then reset the state
          set({ ...initialState, isLoaded: true })
        } catch (error) {
          console.error('Error clearing auth:', error)
          // Ensure state is reset even if storage removal fails
          set({ ...initialState, isLoaded: true })
        }
      },

    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (
          name
        ): Promise<StorageValue<AuthState & AuthActions> | null> => {
          try {
            // Ensure encryption key is loaded before trying to decrypt
            await getEncryptionKeyAsync()

            const value = localStorage.getItem(name)
            if (!value) {
              return null
            }

            const decrypted =
              decryptData<StorageValue<AuthState & AuthActions>>(value)

            // If decryption failed, it might be because the key changed
            // The decryptData function will try multiple keys, so if it returns null,
            // the data is corrupted or encrypted with an unknown key
            if (!decrypted) {
              console.warn(
                '[AuthStore] Failed to decrypt stored auth data. ' +
                  'This may happen if the encryption key changed. Clearing stored data.'
              )
              // Clear the corrupted data
              localStorage.removeItem(name)
              return null
            }

            return decrypted
          } catch (error) {
            console.error(
              '[AuthStore] Error loading persisted auth data:',
              error
            )
            // Clear potentially corrupted data
            localStorage.removeItem(name)
            return null
          }
        },
        setItem: async (name, value) => {
          try {
            // Ensure encryption key is loaded before trying to encrypt
            await getEncryptionKeyAsync()

            const encrypted = encryptData(value)
            localStorage.setItem(name, encrypted)
          } catch (error) {
            console.error('[AuthStore] Error saving auth data:', error)
            // Don't throw - just log the error
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)

/**
 * Após `setToken`, o decode pode não trazer `clinica_id` (ex.: token GSLP).
 * O objeto `user` do `/api/client-token` traz `clienteId` comum a todos os utilizadores da mesma licença/clínica.
 */
export function mergeUserInfoIntoAuth(user: TokenResponse['user'] | undefined): void {
  if (!user) return

  const r = user as Record<string, unknown>
  const clienteId =
    (typeof user.clienteId === 'string' && user.clienteId ? user.clienteId : '') ||
    (typeof r['ClienteId'] === 'string' ? (r['ClienteId'] as string) : '')
  const perfilId =
    (typeof user.perfilId === 'string' && user.perfilId ? user.perfilId : '') ||
    (typeof r['PerfilId'] === 'string' ? (r['PerfilId'] as string) : '')
  const perfilNome =
    (typeof user.perfilNome === 'string' && user.perfilNome ? user.perfilNome : '') ||
    (typeof r['PerfilNome'] === 'string' ? (r['PerfilNome'] as string) : '')

  const cur = useAuthStore.getState()
  useAuthStore.setState({
    clientId: clienteId || cur.clientId,
    perfilId: perfilId || cur.perfilId,
    perfilNome: perfilNome || cur.perfilNome,
  })
}
