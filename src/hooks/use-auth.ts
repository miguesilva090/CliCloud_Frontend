import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from '@/lib/services/auth/auth.service'
import { toast } from '@/utils/toast-utils'
import { LoginResponse, ResponseStatus } from '@/types/api/responses'

export function useLogin() {
  const navigate = useNavigate()
  const { setToken, setRefreshToken, setExpiryTime } = useAuthStore()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (response: LoginResponse) => {
      if (response.status === ResponseStatus.Success && response.data) {
        setToken(response.data.token)
        setRefreshToken(response.data.refreshToken)
        setExpiryTime(response.data.expiryTime)
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
