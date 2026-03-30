'use client'

import { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { useHeaderNav } from '@/contexts/header-nav-context'
import type { NavItem } from '@/types/navigation/nav.types'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { isTabelasPath, isProcessoClinicoPath } from '@/utils/window-utils'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Icons } from '@/components/ui/icons'
import { TooltipProvider } from '@/components/ui/tooltip'

interface DashboardNavProps {
  items: NavItem[]
  setOpen?: Dispatch<SetStateAction<boolean>>
  /** 
   * Variante visual: 
   * - 'desktop' (default): textos truncados numa linha
   * - 'mobile': textos podem ocupar múltiplas linhas para melhor legibilidade
   */
  variant?: 'desktop' | 'mobile'
}

function collectExpandableMenuIds(
  pathname: string,
  menuItems: NavItem[],
  depth = 0
): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const item of menuItems) {
    const hasSubItems = item.items && item.items.length > 0
    const menuId = `${item.title}-${depth}`
    if (hasSubItems && item.href && pathname.startsWith(item.href + '/')) {
      // Não auto-expandir o nó especial '/area-comum/tabelas' (Tabelas geográficas),
      // que é um \"ramo paralelo\" ao caminho Área Comum → Tabelas → Exames → ...
      if (item.href !== '/area-comum/tabelas') {
        result[menuId] = true
      }
      if (item.items?.length) {
        Object.assign(
          result,
          collectExpandableMenuIds(pathname, item.items, depth + 1)
        )
      }
    }
  }
  return result
}

export function DashboardNav({ items, setOpen, variant = 'desktop' }: DashboardNavProps) {
  const { isMinimized, toggle } = useSidebar()
  const { setCurrentMenu, currentMenu, setActiveMenuItem } = useHeaderNav()
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  )

  // Auto-expand parent menus when the current path is under one of their children (e.g. /area-clinica/processo-clinico or /area-comum/tabelas)
  useEffect(() => {
    const toExpand = collectExpandableMenuIds(location.pathname, items)
    if (Object.keys(toExpand).length > 0) {
      setExpandedMenus((prev) => ({ ...prev, ...toExpand }))
    }
  }, [location.pathname, items])

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
    itemHref: string,
    items: NavItem[] | undefined,
    depth: number
  ) => {
    const isExactMatch = location.pathname === itemHref
    const isNestedMatch = location.pathname.startsWith(itemHref + '/')
    const isChildActive = items?.some(
      (child) =>
        location.pathname === child.href ||
        location.pathname.startsWith(child.href + '/')
    )
    // Regra:
    // - depth 0 e 1 (áreas e entrada \"Tabelas\" em Área Comum): ativo se for a rota ou qualquer descendente.
    // - depth 2 (Exames, Consultas, Tratamentos, etc.): também consideramos descendentes,
    //   EXCEPTO para o nó especial '/area-comum/tabelas' (Tabelas geográficas), que só deve ser ativo em match exato.
    // - depth >= 3 (folhas como 'Tipos de Exame'): apenas match exato.
    if (itemHref === '/area-comum/tabelas') {
      return isExactMatch
    }
    if (depth <= 2) {
      return isExactMatch || isNestedMatch || isChildActive
    }
    return isExactMatch
  }

  const handleLinkClick = (
    e: React.MouseEvent,
    href: string,
    openInNewTab?: boolean,
    underDevelopment?: boolean,
    _label?: string
  ) => {
    if (underDevelopment) {
      e.preventDefault()
      return
    }
    if (openInNewTab) {
      e.preventDefault()
      window.open(`${window.location.origin}${href}`, '_blank', 'noopener,noreferrer')
      return
    }
    // Deixar o <Link> tratar da navegação normal para listagens.
  }

  const renderMenuItem = (item: NavItem, depth: number = 0) => {
    const Icon = item.icon
      ? Icons[item.icon] || Icons.arrowRight
      : Icons.arrowRight
    const hasSubItems = item.items && item.items.length > 0
    const menuId = `${item.title}-${depth}`
    const isExpanded = expandedMenus[menuId]
    const showIcon = depth === 0
    const isMobileVariant = variant === 'mobile'

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
                isItemActive(item.href, item.items, depth) && 'active',
                isMinimized && 'justify-center px-0',
                item.underDevelopment && 'cursor-not-allowed opacity-75'
              )}
            >
              <div className='flex items-center gap-3'>
                {showIcon && (
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
                )}
                {!isMinimized && (
                  <span
                    className={cn(
                      isMobileVariant
                        ? 'whitespace-normal break-words leading-snug text-[0.9rem]'
                        : 'truncate'
                    )}
                  >
                    {item.label || item.title}
                  </span>
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
                {item.items?.map((subItem) => renderMenuItem(subItem, depth + 1))}
              </div>
            )}
          </>
        ) : (
          (() => {
            const href = item.disabled || item.underDevelopment ? '#' : item.href
            const useHard =
              href !== '#' && (isTabelasPath(href) || isProcessoClinicoPath(href))
            const className = cn(
              'sidebar-nav-item',
              isItemActive(item.href, item.items, depth) && 'active',
              (item.disabled || item.underDevelopment) &&
                'cursor-not-allowed opacity-75',
              isMinimized && 'justify-center'
            )
            const content = (
              <>
                {showIcon && (
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
                )}
                {!isMinimized && (
                  <span
                    className={cn(
                      isMobileVariant
                        ? 'whitespace-normal break-words leading-snug text-[0.9rem]'
                        : 'truncate'
                    )}
                  >
                    {item.label || item.title}
                  </span>
                )}
              </>
            )
            if (useHard) {
              return (
                <button
                  type='button'
                  className={className}
                  onClick={() => {
                    handleMenuClick(item.title, hasSubItems)
                    window.location.href = window.location.origin + href
                  }}
                >
                  {content}
                </button>
              )
            }
            return (
              <Link
                to={href}
                className={className}
                onClick={(e) => {
                  handleLinkClick(
                    e,
                    item.href,
                    item.openInNewTab,
                    item.underDevelopment,
                    item.label || item.title
                  )
                  if (!item.underDevelopment) {
                    handleMenuClick(item.title, hasSubItems)
                  } else {
                    e.preventDefault()
                  }
                }}
              >
                {content}
              </Link>
            )
          })()
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
