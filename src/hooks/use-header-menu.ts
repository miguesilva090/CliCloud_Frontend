import { useEffect, useState, useCallback } from 'react'
import { roleHeaderMenus } from '@/config/menu-items'
import { MenuItem } from '@/types/navigation/menu.types'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore, PermissionFlag } from '@/stores/permissions-store'

export const filterHeaderMenuByPermission = (
  items: MenuItem[],
  hasPermission: (id: string, flag: PermissionFlag) => boolean
): MenuItem[] => {
  return items.filter((item) => {
    // If the item has a funcionalidadeId, check if user has permission
    if (item.funcionalidadeId) {
      // Check if user has at least AuthVer permission for this functionality
      if (!hasPermission(item.funcionalidadeId, 'AuthVer')) {
        return false
      }
    }

    // Recursively filter sub-items if they exist
    if (item.items) {
      item.items = filterHeaderMenuByPermission(item.items, hasPermission)
      // Remove the item if it has no visible sub-items
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
