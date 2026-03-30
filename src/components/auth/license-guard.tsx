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
}

export function LicenseGuard({
  children,
  requiredLicenseId,
  requiredPermission,
  requiredModule,
  actionType = 'AuthVer',
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

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission, actionType)) {
    return <Navigate to='/404' replace />
  }

  return <>{children}</>
}
