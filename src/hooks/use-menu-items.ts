import { useEffect, useState, useCallback } from 'react'
import { roleMenuItems, roleHeaderMenus } from '@/config/menu-items'
import { MenuItem } from '@/types/navigation/menu.types'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { PermissionFlag } from '@/stores/permissions-store'
import {
  filterHeaderMenuByPermission,
  hasMenuFuncionalidadeAccess,
} from '@/hooks/use-header-menu'

const filterMenuItemsByPermission = (
  items: MenuItem[],
  hasPermission: (permissionId: string, flag: PermissionFlag) => boolean,
  hasModuleAccess: (moduleId: string) => boolean,
  isTopLevel = false
): MenuItem[] => {
  return items.filter((item) => {
    // Categorias de topo na sidebar: mostrar sempre para o role; só filtrar os filhos
    if (isTopLevel) {
      if (item.items) {
        item.items = filterMenuItemsByPermission(
          item.items,
          hasPermission,
          hasModuleAccess,
          false
        )
      }
      if (item.dropdown) {
        item.dropdown = filterMenuItemsByPermission(
          item.dropdown,
          hasPermission,
          hasModuleAccess,
          false
        )
      }
      return true
    }

    // For main menu items (sidebar), only check moduloId
    if (item.moduloId) {
      return hasModuleAccess(item.moduloId)
    }

    // For sub-items and other menu items, check funcionalidadeId
    if (item.funcionalidadeId) {
      if (!hasMenuFuncionalidadeAccess(item, hasPermission)) {
        return false
      }
    }

    // Recursively filter sub-items if they exist
    if (item.items) {
      item.items = filterMenuItemsByPermission(
        item.items,
        hasPermission,
        hasModuleAccess,
        false
      )
      if (item.items.length === 0) {
        return false
      }
    }

    if (item.dropdown) {
      const filteredDropdown = filterMenuItemsByPermission(
        item.dropdown,
        hasPermission,
        hasModuleAccess,
        false
      )
      if (filteredDropdown.length > 0) {
        item.dropdown = filteredDropdown
        return true
      }
      return false
    }

    return true
  })
}

/** Converte itens do header para formato sidebar (title, items em vez de dropdown) para uso no DashboardNav. */
function normalizeHeaderItemsForSidebar(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    const children = item.items?.length
      ? normalizeHeaderItemsForSidebar(item.items)
      : (item.dropdown?.length ? normalizeHeaderItemsForSidebar(item.dropdown) : [])
    return {
      ...item,
      title: item.title ?? item.label?.replace(/\s+/g, '-').toLowerCase() ?? item.href,
      items: children.length ? children : undefined,
      dropdown: undefined,
    } as MenuItem
  })
}

/** Enriquece a árvore do menu da sidebar com os submenus do header (processo-clinico, tabelas) para que em mobile tenham as mesmas opções que no header em desktop. */
function enrichSidebarWithHeaderMenus(
  items: MenuItem[],
  role: string,
  hasPermission: (id: string, flag: PermissionFlag) => boolean
): MenuItem[] {
  const headerMenus = roleHeaderMenus[role as keyof typeof roleHeaderMenus]
  if (!headerMenus || typeof headerMenus !== 'object') return items

  return items.map((item) => {
    const key = item.title?.toLowerCase()
    const nextItems = item.items?.length
      ? enrichSidebarWithHeaderMenus(item.items, role, hasPermission)
      : undefined

    if (key === 'processo-clinico' || key === 'tabelas') {
      const raw = (headerMenus as Record<string, MenuItem[]>)[key]
      if (Array.isArray(raw) && raw.length > 0) {
        const copy = JSON.parse(JSON.stringify(raw)) as MenuItem[]
        const filtered = filterHeaderMenuByPermission(copy, hasPermission)
        const normalized = normalizeHeaderItemsForSidebar(filtered)
        return {
          ...item,
          items: [...(nextItems ?? []), ...normalized],
        }
      }
    }

    if (nextItems) return { ...item, items: nextItems }
    return item
  })
}

export const useMenuItems = (): MenuItem[] => {
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase() || 'guest'
  const hasPermission = usePermissionsStore((state) => state.hasPermission)
  const hasModuleAccess = usePermissionsStore((state) => state.hasModuleAccess)
  const permissions = usePermissionsStore((state) => state.permissions)
  const modules = usePermissionsStore((state) => state.modules)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  const updateMenuItems = useCallback(() => {
    const baseMenuItems = JSON.parse(
      JSON.stringify(
        roleMenuItems[role as keyof typeof roleMenuItems] || roleMenuItems.guest
      )
    )
    const filteredItems = filterMenuItemsByPermission(
      baseMenuItems,
      hasPermission,
      hasModuleAccess,
      role === 'client' // categorias de topo sempre visíveis para client
    )
    setMenuItems(filteredItems)
  }, [role, permissions, modules, hasPermission, hasModuleAccess])

  useEffect(() => {
    updateMenuItems()
  }, [updateMenuItems])

  return menuItems
}

/** Versão para sidebar mobile: inclui também os submenus do header (processo-clinico, tabelas) dentro da própria sidebar. */
export const useMenuItemsWithHeaderSubmenus = (): MenuItem[] => {
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase() || 'guest'
  const hasPermission = usePermissionsStore((state) => state.hasPermission)
  const hasModuleAccess = usePermissionsStore((state) => state.hasModuleAccess)
  const permissions = usePermissionsStore((state) => state.permissions)
  const modules = usePermissionsStore((state) => state.modules)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  const updateMenuItems = useCallback(() => {
    const baseMenuItems = JSON.parse(
      JSON.stringify(
        roleMenuItems[role as keyof typeof roleMenuItems] || roleMenuItems.guest
      )
    )
    const filteredItems = filterMenuItemsByPermission(
      baseMenuItems,
      hasPermission,
      hasModuleAccess,
      role === 'client'
    )
    const enriched = enrichSidebarWithHeaderMenus(filteredItems, role, hasPermission)
    setMenuItems(enriched)
  }, [role, permissions, modules, hasPermission, hasModuleAccess])

  useEffect(() => {
    updateMenuItems()
  }, [updateMenuItems])

  return menuItems
}
