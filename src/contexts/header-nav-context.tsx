import React, { createContext, useContext, useState, useEffect } from 'react'
import { MenuItem } from '@/types/navigation/menu.types'
import { useLocation } from 'react-router-dom'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useHeaderMenu } from '@/hooks/use-header-menu'
import { useMenuItems } from '@/hooks/use-menu-items'

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

    for (const item of headerMenuItems) {
      if (pathname.startsWith(item.href)) {
        // Item matches: return it if it has sub-items (items or dropdown)
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

      // Check nested items (sub-item href match)
      if (item.items) {
        for (const subItem of item.items) {
          if (pathname.startsWith(subItem.href)) {
            if (
              (subItem.dropdown && subItem.dropdown.length > 0) ||
              (subItem.href && pathname === subItem.href)
            ) {
              return {
                label: subItem.label,
                href: subItem.href,
                items: [subItem],
              }
            }
          }
        }
      }
    }

    return null
  }

  // Update current menu based on location (prefer most specific / nested match so header shows sub-menu)
  useEffect(() => {
    const determineCurrentMenu = (pathname: string): string => {
      // Rotas de utentes/medicos/organismos devem usar o menu de Tabelas da Área Comum
      if (
        pathname.startsWith('/utentes') ||
        pathname.startsWith('/medicos') ||
        pathname.startsWith('/organismos') ||
        pathname.startsWith('/fornecedores')
      ) {
        return 'tabelas'
      }

      // Área Clínica: em /area-clinica (ou antes do redirect) mostrar submenu Processo Clínico, como na área-comum
      if (pathname === '/area-clinica' || pathname.startsWith('/area-clinica/processo-clinico')) {
        return 'processo-clinico'
      }

      // First check nested items and pick the most specific match
      // (longest href wins, e.g. /area-comum/utilitarios over /area-comum)
      const nestedCandidates = menuItems
        .flatMap((item) => item.items ?? [])
        .filter(
          (subItem) =>
            pathname === subItem.href ||
            pathname.startsWith(subItem.href + '/')
        )
        .sort((a, b) => b.href.length - a.href.length)
      if (nestedCandidates.length > 0 && nestedCandidates[0].title) {
        return nestedCandidates[0].title
      }

      // Then check direct top-level matches
      const directMatch = menuItems.find(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/')
      )
      if (directMatch?.title) return directMatch.title

      return 'dashboard'
    }

    const newCurrentMenu = determineCurrentMenu(location.pathname)
    setCurrentMenu(newCurrentMenu)
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
