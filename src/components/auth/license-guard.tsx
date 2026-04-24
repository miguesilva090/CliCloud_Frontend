import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { PermissionFlag } from '@/stores/permissions-store'

interface LicenseGuardProps {
  children: React.ReactNode
  requiredLicenseId?: string
  requiredPermission?: string
  requiredModule?: string
  actionType?: PermissionFlag
  /**
   * Quando true, a permissão principal só conta com entrada explícita na licença
   * (flags); não usa o atalho «tem o módulo». Útil para subáreas com controlo fino.
   */
  requireExplicitPermission?: boolean
  /**
   * Se a principal falhar, aceitar qualquer uma destas (ex.: permissão legada
   * «Processo clínico» que cobria todas as sub-rotas).
   */
  permissionFallbackIds?: string[]
}

export function LicenseGuard({
  children,
  requiredLicenseId,
  requiredPermission,
  requiredModule,
  actionType = 'AuthVer',
  requireExplicitPermission = false,
  permissionFallbackIds,
}: LicenseGuardProps) {
  const location = useLocation()
  const { hasLicenseAccess, hasPermission, hasModuleAccess } =
    usePermissionsStore()
  const { isAuthenticated } = useAuthStore()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Check license access if required
  if (requiredLicenseId && !hasLicenseAccess(requiredLicenseId)) {
    return <Navigate to='/404' replace />
  }

  // Check module access if required
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <Navigate to='/404' replace />
  }

  if (requiredPermission) {
    const { getPermissionFlags } = usePermissionsStore.getState()
    const strictPrimary = requireExplicitPermission

    const resolvedAccess = (
      permId: string,
      strictNoModuleShortcut: boolean
    ): boolean => {
      const flags = getPermissionFlags(permId)
      if (flags) {
        return !!flags[actionType]
      }
      if (strictNoModuleShortcut) {
        return false
      }
      if (requiredModule && hasModuleAccess(requiredModule)) {
        return true
      }
      return hasPermission(permId, actionType)
    }

    const fallbacks = permissionFallbackIds ?? []
    const allowed =
      resolvedAccess(requiredPermission, strictPrimary) ||
      fallbacks.some((id) => resolvedAccess(id, false))

    if (!allowed) {
      return <Navigate to='/404' replace />
    }
  }

  return <>{children}</>
}
