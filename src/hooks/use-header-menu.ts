import { useEffect, useState, useCallback } from 'react'
import { roleHeaderMenus } from '@/config/menu-items'
import { MenuItem } from '@/types/navigation/menu.types'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore, PermissionFlag } from '@/stores/permissions-store'

/** Alinhado com `filterHeaderMenuByPermission`: respeita `funcionalidadeFallbackIds`. */
export function hasMenuFuncionalidadeAccess(
  item: MenuItem,
  hasPermission: (id: string, flag: PermissionFlag) => boolean
): boolean {
  if (!item.funcionalidadeId) {
    return true
  }
  if (hasPermission(item.funcionalidadeId, 'AuthVer')) {
    return true
  }
  for (const fb of item.funcionalidadeFallbackIds ?? []) {
    if (hasPermission(fb, 'AuthVer')) {
      return true
    }
  }
  return false
}

export const filterHeaderMenuByPermission = (
  items: MenuItem[],
  hasPermission: (id: string, flag: PermissionFlag) => boolean
): MenuItem[] => {
  return items.filter((item) => {
    if (item.funcionalidadeId && !hasMenuFuncionalidadeAccess(item, hasPermission)) {
      return false
    }

    // Recursively filter sub-items if they exist
    if (item.items) {
      item.items = filterHeaderMenuByPermission(item.items, hasPermission)
      /* Sem filhos visíveis: remover o grupo (evita mostrar entradas por fallbacks entre
       * funcionalidades; cada filho deve ter AuthVer no próprio GUID). */
      if (item.items.length === 0) {
        return false
      }
    }

    // Handle dropdown items differently - show if any child has permission
    if (item.dropdown) {
      const filteredDropdown = filterHeaderMenuByPermission(
        item.dropdown,
        hasPermission
      )
      // Only keep the dropdown if at least one child is visible
      if (filteredDropdown.length > 0) {
        item.dropdown = filteredDropdown
        return true
      }
      return false
    }

    return true
  })
}

export const useHeaderMenu = (currentMenu: string): MenuItem[] => {
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase() || 'guest'
  const { hasPermission, permissions } = usePermissionsStore()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  const updateMenuItems = useCallback(() => {
    const baseMenuItems = JSON.parse(
      JSON.stringify(
        roleHeaderMenus[role as keyof typeof roleHeaderMenus] || []
      )
    )
    const filteredItems = filterHeaderMenuByPermission(
      baseMenuItems[currentMenu as keyof typeof baseMenuItems] || [],
      hasPermission
    )
    setMenuItems(filteredItems)
  }, [role, currentMenu, permissions, hasPermission])

  useEffect(() => {
    updateMenuItems()
  }, [updateMenuItems])

  return menuItems
}
