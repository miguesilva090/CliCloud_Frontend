import React, { createContext, useContext, useState, useEffect } from 'react'
import { MenuItem } from '@/types/navigation/menu.types'
import { useLocation } from 'react-router-dom'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useHeaderMenu } from '@/hooks/use-header-menu'
import { useMenuItems } from '@/hooks/use-menu-items'
import { determineCurrentMenuFromPathname } from '@/utils/determine-current-menu'

interface HeaderNavContextType {
  currentMenu: string
  setCurrentMenu: (menu: string) => void
  activeMenuItem: MenuItem | null
  setActiveMenuItem: (item: MenuItem | null) => void
}

export const HeaderNavContext = createContext<HeaderNavContextType | undefined>(
  undefined
)

export function useHeaderNav() {
  const context = useContext(HeaderNavContext)
  if (!context) {
    throw new Error('useHeaderNav must be used within a HeaderNavProvider')
  }
  return context
}

export const HeaderNavProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMenu, setCurrentMenu] = useState('')
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem | null>(null)
  const location = useLocation()
  const menuItems = useMenuItems()
  const headerMenuItems = useHeaderMenu(currentMenu)
  const { permissions } = usePermissionsStore()

  const findActiveMenuItem = (pathname: string) => {
    if (!headerMenuItems?.length) return null

    // Prefer the group whose *child* href matches most specifically (longest prefix).
    // Área administrativa: every group shares href `/area-administrativa`, so we must
    // not return the first group on pathname.startsWith(parent) alone (unlike processo
    // clínico, where each group has a distinct parent href).
    let bestGroup: MenuItem | null = null
    let bestChildHrefLen = -1

    for (const item of headerMenuItems) {
      if (!item.items?.length) continue
      const matchedChild = item.items
        .filter(
          (subItem) =>
            pathname === subItem.href ||
            pathname.startsWith(`${subItem.href}/`)
        )
        .sort((a, b) => b.href.length - a.href.length)[0]

      if (matchedChild && matchedChild.href.length > bestChildHrefLen) {
        bestChildHrefLen = matchedChild.href.length
        bestGroup = item
      }
    }

    if (bestGroup) {
      return {
        label: bestGroup.label,
        href: bestGroup.href,
        items: bestGroup.items,
      }
    }

    // Hub pages: só coincidência exacta com o href do grupo. Se usarmos startsWith aqui,
    // em área administrativa todos os grupos partilham `/area-administrativa` e o primeiro
    // item (ex. Marcações) ficaria sempre activo em `/area-administrativa/consultas`.
    for (const item of headerMenuItems) {
      if (pathname === item.href) {
        if (item.items?.length) {
          const hasDropdowns = item.items.some(
            (subItem) => subItem.dropdown && subItem.dropdown.length > 0
          )
          const hasDirectItems = item.items.length > 0
          if (hasDropdowns || hasDirectItems) {
            return {
              label: item.label,
              href: item.href,
              items: item.items,
            }
          }
        }
      }
    }

    return null
  }

  useEffect(() => {
    setCurrentMenu(
      determineCurrentMenuFromPathname(location.pathname, menuItems)
    )
  }, [location.pathname, menuItems])

  // Update active menu item when location or permissions change
  useEffect(() => {
    const newActiveMenuItem = findActiveMenuItem(location.pathname)
    setActiveMenuItem(newActiveMenuItem)
  }, [location.pathname, headerMenuItems, permissions])

  return (
    <HeaderNavContext.Provider
      value={{
        currentMenu,
        setCurrentMenu,
        activeMenuItem,
        setActiveMenuItem,
      }}
    >
      {children}
    </HeaderNavContext.Provider>
  )
}
