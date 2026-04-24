import * as React from 'react'
import { useHeaderNav } from '@/contexts/header-nav-context'
import { MenuItem } from '@/types/navigation/menu.types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { Logo } from '@/assets/logo-letters'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { cn } from '@/lib/utils'
import { shouldManageWindow, navigateManagedWindow } from '@/utils/window-utils'
import {
  hasMenuFuncionalidadeAccess,
  useHeaderMenu,
} from '@/hooks/use-header-menu'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { ListItem } from '@/components/ui/navigation-menu-item'
import { AppOptionsDrawer } from '@/components/shared/app-options-drawer'
import { ConnectionStatusIndicator } from '@/components/shared/connection-status-indicator'
import { HeaderMemoryMonitor } from '@/components/shared/header-memory-monitor'
import { ModeToggle } from '@/components/shared/theme-toggle'
import UserNav from '@/components/shared/user-nav'
import { VersionModal } from '@/components/shared/version-modal'

export function HeaderNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentMenu, setCurrentMenu } = useHeaderNav()
  const menuItems = useHeaderMenu(currentMenu) as MenuItem[]
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase()
  const { hasPermission } = usePermissionsStore()
  const { windows, minimizeWindow } = useWindowsStore()
  const [openMenuItem, setOpenMenuItem] = React.useState<string | undefined>(
    undefined
  )
  const [isVersionModalOpen, setIsVersionModalOpen] = React.useState(false)

  const hasItemPermission = (item: MenuItem): boolean =>
    hasMenuFuncionalidadeAccess(item, hasPermission)

  const filteredMenuItems = menuItems.filter(hasItemPermission)

  const isItemActive = (href: string, items?: MenuItem[]) => {
    // For menu items with subitems
    if (items) {
      const hasActiveChild = items.some((subItem) => {
        // Check direct match with subitems
        const isDirectMatch = location.pathname === subItem.href

        // Check nested items (for dropdown menus)
        const hasNestedMatch = subItem.dropdown?.some(
          (dropdownItem) => location.pathname === dropdownItem.href
        )

        // Check nested `items` (ex.: Configuração → Gestão de Separadores → Separadores / …)
        const hasItemsNestedMatch = subItem.items?.some(
          (nested) =>
            location.pathname === nested.href ||
            location.pathname.startsWith(`${nested.href}/`)
        )

        return isDirectMatch || hasNestedMatch || hasItemsNestedMatch
      })

      return hasActiveChild
    }

    // For administration menu, check role-specific paths
    if (href.includes('administracao')) {
      return location.pathname === `/administracao/${role}`
    }

    // For exact matches, return true immediately
    if (location.pathname === href) {
      return true
    }

    // Split paths into segments for comparison
    const currentPathSegments = location.pathname.split('/').filter(Boolean)
    const hrefSegments = href.split('/').filter(Boolean)

    // For parent routes, we need to be more specific about the relationship
    if (href !== '/' && currentPathSegments.length > hrefSegments.length) {
      // Check if all segments of the href match the corresponding segments in the current path
      const isParentMatch = hrefSegments.every(
        (segment, index) => segment === currentPathSegments[index]
      )

      // Only consider it a match if the next segment after the parent path
      // is not a sibling route (i.e., it's a true child route)
      if (isParentMatch) {
        const nextSegment = currentPathSegments[hrefSegments.length]

        // Dynamic sibling route detection
        // If we're at a level where we have sibling routes (e.g. utilitarios/tabelas/geograficas/...)
        if (nextSegment) {
          // Check if this is a sibling route by looking at the current path structure
          // e.g. utilitarios/tabelas/geograficas/paises vs utilitarios/tabelas/geograficas/distritos
          const currentPathWithoutLastSegment = currentPathSegments
            .slice(0, -1)
            .join('/')
          const hrefPath = hrefSegments.join('/')

          // If the current path without the last segment matches the href exactly,
          // and we have an additional segment, it's likely a sibling route
          if (currentPathWithoutLastSegment === hrefPath) {
            return false
          }
        }

        return true
      }
    }

    return false
  }

  const handleMenuItemClick = (isDropdownTrigger?: boolean) => {
    // Don't modify state if just opening a dropdown
    if (isDropdownTrigger) return
  }

  const handleLinkClick = (
    e: React.MouseEvent,
    href: string,
    openInNewTab?: boolean
  ) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      return
    }

    if (openInNewTab) {
      e.preventDefault()
      const fullUrl = `${window.location.origin}${href}`
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // Igual ao Luma: rotas com janelas/tabs usam instanceId na query
    const pathOnly = href.split('?')[0]
    if (shouldManageWindow(pathOnly)) {
      e.preventDefault()
      if (location.pathname === pathOnly) {
        return
      }
      navigateManagedWindow(navigate, href)
    }
  }

  const submenuLeafLinkClass = cn(
    'flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm outline-none transition-colors duration-150',
    'hover:bg-accent/90 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
  )

  const handleLogoClick = () => {
    setCurrentMenu('dashboard')
    windows.forEach((window) => {
      if(!window.isMinimized) {
        minimizeWindow(window.id)
      }
    })
    useWindowsStore.setState({ activeWindow: null })
    navigate('/')
  }

  return (
    <div>
      <div className='bg-background'>
        <div className='flex min-h-14 flex-shrink-0 items-center gap-2 px-3 sm:px-4'>
          <div className='flex flex-shrink-0 items-center gap-2'>
            <div
              className='cursor-pointer hover:opacity-80 transition-opacity'
              onClick={handleLogoClick}
              role='button'
              aria-label='Navigate to dashboard'
            >
            </div>
          </div>
          <nav
            className='flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1'
            aria-label='Menu principal'
          >
            {filteredMenuItems.map((item, index) => {
              const filteredSubItems = item.items?.filter(hasItemPermission) || []
              /* Grupo sem sub-itens visíveis: mostrar ligação directa ao href do pai (ex.: permissões
               * não carregadas para todos os filhos) em vez de desaparecer do header. */
              if (item.items && filteredSubItems.length === 0) {
                if (!hasItemPermission(item)) return null
                const fallbackActive =
                  item.href === '/area-comum/tabelas/notificacoes'
                    ? location.pathname.startsWith('/area-comum/tabelas/notificacoes') ||
                      location.pathname.startsWith('/area-comum/tabelas/notificacao-tipos')
                    : isItemActive(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      fallbackActive && 'bg-accent text-accent-foreground'
                    )}
                    onClick={(e) =>
                      handleLinkClick(e, item.href, item.openInNewTab)
                    }
                  >
                    <span>{item.label}</span>
                  </Link>
                )
              }

              if (!item.items) {
                const linkActive =
                  item.href === '/area-comum/tabelas/notificacoes'
                    ? location.pathname.startsWith('/area-comum/tabelas/notificacoes') ||
                      location.pathname.startsWith('/area-comum/tabelas/notificacao-tipos')
                    : isItemActive(item.href)
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      linkActive && 'bg-accent text-accent-foreground'
                    )}
                    onClick={(e) =>
                      handleLinkClick(e, item.href, item.openInNewTab)
                    }
                  >
                    <span>{item.label}</span>
                  </Link>
                )
              }

              return (
                <DropdownMenu
                  key={item.href}
                  modal
                  open={openMenuItem === item.href}
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenMenuItem(item.href)
                    } else {
                      setOpenMenuItem(undefined)
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'group gap-0',
                        isItemActive(item.href, item.items) &&
                          'bg-accent text-accent-foreground'
                      )}
                      onClick={() => handleMenuItemClick(true)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className='relative top-[1px] ml-1 h-3 w-3 shrink-0 transition duration-200 group-data-[state=open]:rotate-180'
                        aria-hidden
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    sideOffset={8}
                    className='z-[60] overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/[0.08] dark:border-border dark:shadow-black/30'
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className='flex min-w-[220px] max-w-[min(100vw-2rem,320px)] flex-col gap-1 px-1 py-1.5'>
                      {filteredSubItems.map((subItem, subIndex) => {
                        const nestedFromDropdown = (subItem.dropdown || []).filter(
                          hasItemPermission
                        )
                        const nestedFromItems = (subItem.items || []).filter(
                          hasItemPermission
                        )

                        const activeState = nestedFromDropdown.length
                          ? nestedFromDropdown.some((dropdownItem) => {
                              const childHref = dropdownItem.href
                              return (
                                location.pathname === childHref ||
                                location.pathname.startsWith(
                                  childHref + '/'
                                )
                              )
                            })
                          : nestedFromItems.length
                            ? nestedFromItems.some(
                                (nested) =>
                                  location.pathname === nested.href ||
                                  location.pathname.startsWith(`${nested.href}/`)
                              ) ||
                              location.pathname === subItem.href ||
                              location.pathname.startsWith(`${subItem.href}/`)
                            : isItemActive(subItem.href)

                        if (subItem.dropdown?.length && nestedFromDropdown.length === 0) {
                          return null
                        }

                        if (subItem.items?.length && nestedFromItems.length === 0) {
                          return null
                        }

                        if (nestedFromDropdown.length > 0) {
                          return (
                            <DropdownMenuSub key={subIndex}>
                              <DropdownMenuSubTrigger
                                className={cn(
                                  'w-full rounded-lg border border-transparent text-left text-foreground hover:text-accent-foreground data-[state=open]:border-border/60',
                                  activeState &&
                                    'bg-accent text-accent-foreground data-[state=open]:bg-accent'
                                )}
                              >
                                {subItem.label}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent
                                sideOffset={8}
                                alignOffset={-2}
                                className='z-[70] min-w-[200px] max-w-[min(100vw-2rem,320px)] border-border bg-popover p-1.5 shadow-lg dark:shadow-black/30'
                              >
                                {nestedFromDropdown.map((dropdownItem, dropdownIndex) => {
                                  const childActive =
                                    location.pathname === dropdownItem.href ||
                                    location.pathname.startsWith(
                                      `${dropdownItem.href}/`
                                    )
                                  return (
                                    <DropdownMenuItem key={dropdownIndex} asChild>
                                      <Link
                                        to={dropdownItem.href}
                                        className={cn(
                                          submenuLeafLinkClass,
                                          childActive &&
                                            'bg-accent text-accent-foreground'
                                        )}
                                        onClick={(e) => {
                                          handleLinkClick(
                                            e,
                                            dropdownItem.href,
                                            dropdownItem.openInNewTab
                                          )
                                          setOpenMenuItem(undefined)
                                        }}
                                      >
                                        {dropdownItem.label}
                                      </Link>
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )
                        }

                        if (nestedFromItems.length > 0) {
                          return (
                            <DropdownMenuSub key={subIndex}>
                              <DropdownMenuSubTrigger
                                className={cn(
                                  'w-full rounded-lg border border-transparent text-left text-foreground hover:text-accent-foreground data-[state=open]:border-border/60',
                                  activeState &&
                                    'bg-accent text-accent-foreground data-[state=open]:bg-accent'
                                )}
                              >
                                {subItem.label}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent
                                sideOffset={8}
                                alignOffset={-2}
                                className='z-[70] min-w-[200px] max-w-[min(100vw-2rem,320px)] border-border bg-popover p-1.5 shadow-lg dark:shadow-black/30'
                              >
                                {nestedFromItems.map((nestedItem, nestedIndex) => {
                                  const childActive =
                                    location.pathname === nestedItem.href ||
                                    location.pathname.startsWith(`${nestedItem.href}/`)
                                  return (
                                    <DropdownMenuItem key={nestedIndex} asChild>
                                      <Link
                                        to={nestedItem.href}
                                        className={cn(
                                          submenuLeafLinkClass,
                                          childActive &&
                                            'bg-accent text-accent-foreground'
                                        )}
                                        onClick={(e) => {
                                          handleLinkClick(
                                            e,
                                            nestedItem.href,
                                            nestedItem.openInNewTab
                                          )
                                          setOpenMenuItem(undefined)
                                        }}
                                      >
                                        {nestedItem.label}
                                      </Link>
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )
                        }

                        return (
                          <ListItem
                            key={subIndex}
                            title={subItem.label}
                            to={subItem.href}
                            className={cn(
                              activeState &&
                                'bg-accent text-accent-foreground'
                            )}
                            onClick={(e) => {
                              setOpenMenuItem(undefined)
                              handleLinkClick(
                                e,
                                subItem.href,
                                subItem.openInNewTab
                              )
                            }}
                          />
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}
          </nav>
          <div className='ml-auto flex items-center space-x-2'>
            <ConnectionStatusIndicator />
            <AppOptionsDrawer />
            <Button
              variant='outline'
              size='icon'
              onClick={() => setIsVersionModalOpen(true)}
              className='transition-all duration-150 hover:scale-105 active:scale-95'
              title='Ver versões'
            >
              <Icons.help className='h-[1.2rem] w-[1.2rem]' />
              <span className='sr-only'>Ver versões</span>
            </Button>
            <ModeToggle />
            <HeaderMemoryMonitor />
            <UserNav />
          </div>
          <VersionModal
            open={isVersionModalOpen}
            onOpenChange={setIsVersionModalOpen}
          />
        </div>
      </div>
    </div>
  )
}
