import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mergeUserInfoIntoAuth, useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { authService } from '@/lib/services/auth/auth.service'
import { toast } from '@/utils/toast-utils'
import { LoginResponse, ResponseStatus } from '@/types/api/responses'

export function useLogin() {
  const navigate = useNavigate()
  const { setToken, setRefreshToken, setExpiryTime } = useAuthStore()
  const setPermissions = usePermissionsStore((state) => state.setPermissions)
  const setModules = usePermissionsStore((state) => state.setModules)

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (response: LoginResponse) => {
      const isSuccess =
        response.status === ResponseStatus.Success || response.succeeded === true

      if (isSuccess && response.data) {
        setToken(response.data.token)
        setRefreshToken(response.data.refreshToken)
        setExpiryTime(response.data.expiryTime)
        mergeUserInfoIntoAuth(response.data.user)

        // Access control flow: hydrate permission stores when present.
        if (response.data.license) {
          useAuthStore.setState({
            permissions: response.data.license.permissions || {},
            modules: response.data.license.modules || [],
          })
          setPermissions(response.data.license.permissions || {})
          setModules(response.data.license.modules || [])
        }

        navigate('/')
        return
      }

      const firstError =
        response.messages?.['$']?.[0] ||
        Object.values(response.messages || {})?.[0]?.[0] ||
        'Falha no login'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error)
      toast.error('Falha no login')
    },
  })
}
