'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { useHeaderNav } from '@/contexts/header-nav-context'
import type { NavItem } from '@/types/navigation/nav.types'
import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { shouldManageWindow, navigateManagedWindow } from '@/utils/window-utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Icons } from '@/components/ui/icons'
import { TooltipProvider } from '@/components/ui/tooltip'

interface DashboardNavProps {
  items: NavItem[]
  setOpen?: Dispatch<SetStateAction<boolean>>
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const { isMinimized, toggle } = useSidebar()
  const { setCurrentMenu, currentMenu, setActiveMenuItem } = useHeaderNav()
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const handleMenuClick = (
    title: string | undefined,
    hasSubItems?: boolean
  ) => {
    const menuTitle = title?.toLowerCase() ?? ''
    if (menuTitle !== currentMenu) {
      setActiveMenuItem(null)
      setCurrentMenu(menuTitle)
    }
    if (setOpen) setOpen(false)

    // Auto-expand sidebar if minimized and item has subitems
    if (isMinimized && hasSubItems) {
      toggle()
    }
  }

  const isItemActive = (
    _itemTitle: string | undefined,
    itemHref: string,
    items?: NavItem[],
    options?: {
      parentHref?: string
    }
  ) => {
    const isExactMatch = location.pathname === itemHref
    const isSameHrefAsParent =
      !!options?.parentHref && options.parentHref === itemHref
    const isNestedMatch =
      !isSameHrefAsParent && location.pathname.startsWith(itemHref + '/')
    const isChildActive = items?.some(
      (item) =>
        location.pathname === item.href ||
        location.pathname.startsWith(item.href + '/')
    )

    return isExactMatch || isNestedMatch || isChildActive
  }

  const handleLinkClick = (
    e: React.MouseEvent,
    href: string,
    openInNewTab?: boolean,
    underDevelopment?: boolean
  ) => {
    // Prevent navigation if item is under development
    if (underDevelopment) {
      e.preventDefault()
      return
    }

    // If item should open in new tab
    if (openInNewTab) {
      e.preventDefault()
      const fullUrl = `${window.location.origin}${href}`
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // Igual ao Luma: janelas/tabs com instanceId; não alterar URL se já estamos no mesmo path
    const pathOnly = href.split('?')[0]
    if (shouldManageWindow(pathOnly)) {
      e.preventDefault()
      if (location.pathname === pathOnly) {
        return
      }
      navigateManagedWindow(navigate, href)
      return
    }
  }

  const renderMenuItem = (
    item: NavItem,
    depth: number = 0,
    parentHref?: string
  ) => {
    const Icon = item.icon
      ? Icons[item.icon] || Icons.arrowRight
      : Icons.arrowRight
    const hasSubItems = item.items && item.items.length > 0
    const menuId = `${item.title}-${depth}`
    const isExpanded = expandedMenus[menuId]

    return (
      <div
        key={menuId}
        className={cn(
          'space-y-1',
          depth > 0 && !isMinimized && 'ml-4',
          isMinimized && 'space-y-0.5'
        )}
      >
        {hasSubItems ? (
          <>
            <button
              onClick={() => {
                if (!item.underDevelopment) {
                  toggleMenu(menuId)
                  if (isMinimized) toggle()
                }
              }}
              className={cn(
                'sidebar-link relative',
                isItemActive(item.title, item.href, item.items, { parentHref }) &&
                  'active',
                isMinimized && 'justify-center px-0',
                item.underDevelopment && 'cursor-not-allowed opacity-75'
              )}
            >
              <div className='flex items-center gap-3'>
                <div className='icon-wrapper relative'>
                  <Icon
                    className={cn('size-4', isMinimized ? 'mx-auto' : 'ml-0')}
                  />
                  {item.underDevelopment && (
                    <div className='absolute -top-0.5 -right-0.5 w-6 h-3 bg-violet-500 text-white text-[6px] font-bold flex items-center justify-center -rotate-[8deg] shadow-sm border border-violet-600/30'>
                      des
                    </div>
                  )}
                </div>
                {!isMinimized && (
                  <span className='truncate'>{item.label || item.title}</span>
                )}
              </div>
              {!isMinimized && (
                <ChevronRight
                  className={cn(
                    'mr-2 h-4 w-4 transition-transform text-primary',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
            </button>
            {isExpanded && !isMinimized && (
              <div className='pl-4'>
                {item.items?.map((subItem) =>
                  renderMenuItem(subItem, depth + 1, item.href)
                )}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.disabled || item.underDevelopment ? '#' : item.href}
            className={cn(
              'sidebar-nav-item',
              isItemActive(item.title, item.href, item.items, { parentHref }) &&
                'active',
              (item.disabled || item.underDevelopment) &&
                'cursor-not-allowed opacity-75',
              isMinimized && 'justify-center'
            )}
            onClick={(e) => {
              handleLinkClick(
                e,
                item.href,
                item.openInNewTab,
                item.underDevelopment
              )
              if (!item.underDevelopment) {
                handleMenuClick(item.title, hasSubItems)
              } else {
                e.preventDefault()
              }
            }}
          >
            <div className='icon-wrapper relative'>
              <Icon
                className={cn('size-4', isMinimized ? 'mx-auto' : 'ml-0')}
              />
              {item.underDevelopment && (
                <div className='absolute -top-0.5 -right-0.5 w-6 h-3 bg-violet-500 text-white text-[6px] font-bold flex items-center justify-center -rotate-[8deg] shadow-sm border border-violet-600/30'>
                  des
                </div>
              )}
            </div>
            {!isMinimized && (
              <span className='truncate'>{item.label || item.title}</span>
            )}
          </Link>
        )}
      </div>
    )
  }

  if (!items?.length) {
    return null
  }

  return (
    <nav className={cn('grid items-start', isMinimized ? 'gap-1' : 'gap-2')}>
      <TooltipProvider>
        {items.map((item) => renderMenuItem(item))}
      </TooltipProvider>
    </nav>
  )
}
