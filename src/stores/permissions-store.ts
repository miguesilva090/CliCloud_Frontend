import { create } from 'zustand'
import { toast } from '@/components/ui/use-toast'
import { useAuthStore } from './auth-store'

interface PermissionFlags {
  value: number
  binary: string
  AuthVer: boolean
  AuthAdd: boolean
  AuthChg: boolean
  AuthDel: boolean
  AuthPrt: boolean
}

type PermissionFlag = Exclude<keyof PermissionFlags, 'value' | 'binary'>

export type { PermissionFlag }

interface PermissionStore {
  permissions: Record<string, PermissionFlags>
  modules: string[]
  setPermissions: (rawPermissions: Record<string, number>) => void
  setModules: (modules: string[]) => void
  getPermissionFlags: (permissionId: string) => PermissionFlags | null
  hasPermission: (permissionId: string, flag: PermissionFlag) => boolean
  hasLicenseAccess: (licenseId: string) => boolean
  hasModuleAccess: (moduleId: string) => boolean
  getAvailableModules: () => string[]
  havePermissionsChanged: (newRawPermissions: Record<string, number>) => boolean
  haveModulesChanged: (newModules: string[]) => boolean
}

// Convert a number to binary flags
const numberToFlags = (value: number): PermissionFlags => {
  // Convert to binary and pad with zeros to ensure 5 digits
  const binary = value.toString(2).padStart(5, '0')

  // The binary string is read from right to left (least significant bit first)
  // So we need to reverse the string to get the correct order
  const reversedBinary = binary.split('').reverse().join('')

  return {
    value,
    binary: binary,
    AuthVer: reversedBinary[0] === '1', // 1
    AuthAdd: reversedBinary[1] === '1', // 2
    AuthChg: reversedBinary[2] === '1', // 4
    AuthDel: reversedBinary[3] === '1', // 8
    AuthPrt: reversedBinary[4] === '1', // 16
  }
}

const store = create<PermissionStore>()((set, get) => ({
  permissions: {},
  modules: [],

  setPermissions: (rawPermissions: Record<string, number>) => {
    const convertedPermissions: Record<string, PermissionFlags> = {}
    Object.entries(rawPermissions).forEach(([permissionId, value]) => {
      convertedPermissions[permissionId] = numberToFlags(value)
    })

    console.log('Old Permissions:', get().permissions)
    console.log('New Permissions:', convertedPermissions)

    // Check if permissions have changed
    const haveChanged = get().havePermissionsChanged(rawPermissions)
    if (haveChanged) {
      console.log('Permissions have changed!')
      toast({
        title: 'Permissões Atualizadas',
        description:
          'As suas permissões foram atualizadas. Por favor, atualize a página para ver as alterações.',
        variant: 'warning',
      })
    }

    set({ permissions: convertedPermissions })
  },

  setModules: (modules: string[]) => {
    console.log('Old Modules:', get().modules)
    console.log('New Modules:', modules)

    // Check if modules have changed
    const haveChanged = get().haveModulesChanged(modules)
    if (haveChanged) {
      console.log('Modules have changed!')
      toast({
        title: 'Módulos Atualizados',
        description:
          'Os seus módulos disponíveis foram atualizados. Por favor, atualize a página para ver as alterações.',
        variant: 'warning',
      })
    }
    set({ modules })
  },

  getPermissionFlags: (permissionId: string) => {
    // Check local state first
    const localFlags = get().permissions[permissionId]
    if (localFlags) {
      return localFlags
    }

    // Fallback to auth store without updating state (to avoid setState during render)
    const authStore = useAuthStore.getState()
    if (authStore.permissions[permissionId]) {
      return numberToFlags(authStore.permissions[permissionId])
    }

    return null
  },

  hasPermission: (permissionId: string, flag: PermissionFlag) => {
    // Check local state first
    const localFlags = get().permissions[permissionId]
    if (localFlags) {
      return localFlags[flag]
    }

    // Fallback to auth store without updating state (to avoid setState during render)
    const authStore = useAuthStore.getState()
    if (authStore.permissions[permissionId]) {
      const flags = numberToFlags(authStore.permissions[permissionId])
      return flags[flag]
    }

    return false
  },

  hasLicenseAccess: (licenseId: string) => {
    const authStore = useAuthStore.getState()
    return authStore.licencaId === licenseId
  },

  hasModuleAccess: (moduleId: string) => {
    // Check local state first
    const localModules = get().modules
    if (localModules.length > 0) {
      return localModules.includes(moduleId)
    }

    // Fallback to auth store without updating state (to avoid setState during render)
    const authStore = useAuthStore.getState()
    return authStore.modules.includes(moduleId)
  },

  getAvailableModules: () => {
    // Check local state first
    const localModules = get().modules
    if (localModules.length > 0) {
      return localModules
    }

    // Fallback to auth store without updating state (to avoid setState during render)
    const authStore = useAuthStore.getState()
    return authStore.modules
  },

  havePermissionsChanged: (newRawPermissions: Record<string, number>) => {
    const currentPermissions = get().permissions
    const currentKeys = Object.keys(currentPermissions)
    const newKeys = Object.keys(newRawPermissions)

    // If current permissions is empty and new permissions is not empty,
    // this is likely the initial load, not a change
    if (currentKeys.length === 0 && newKeys.length > 0) {
      return false
    }

    // Check if number of permissions changed
    if (currentKeys.length !== newKeys.length) {
      return true
    }

    // Check if any permission values changed
    return currentKeys.some((key) => {
      const currentValue = currentPermissions[key]?.value
      const newValue = newRawPermissions[key]
      return currentValue !== newValue
    })
  },

  haveModulesChanged: (newModules: string[]) => {
    const currentModules = get().modules

    // If current modules is empty and new modules is not empty,
    // this is likely the initial load, not a change
    if (currentModules.length === 0 && newModules.length > 0) {
      return false
    }

    const sortedCurrent = [...currentModules].sort()
    const sortedNew = [...newModules].sort()
    return JSON.stringify(sortedCurrent) !== JSON.stringify(sortedNew)
  },
}))

export const usePermissionsStore = store
