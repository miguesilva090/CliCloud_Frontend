import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

interface RoleRouterProps {
  routes: {
    [key: string]: ReactNode
  }
}

export function RoleRouter({ routes }: RoleRouterProps) {
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase() || 'guest'

  const component = routes[role]

  if (!component) {
    return <Navigate to='/404' replace />
  }

  return <>{component}</>
}
