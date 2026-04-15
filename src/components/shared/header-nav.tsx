import * as React from 'react'
import { Menu } from 'lucide-react'
import { useHeaderNav } from '@/contexts/header-nav-context'
import { useSidebarOpen } from '@/contexts/sidebar-open-context'
import { MenuItem } from '@/types/navigation/menu.types'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { Logo } from '@/assets/logo-letters'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { isTabelasPath, isProcessoClinicoPath } from '@/utils/window-utils'
import { cn } from '@/lib/utils'
import { useHeaderMenu } from '@/hooks/use-header-menu'
import { useTheme } from '@/providers/theme-provider'
import { getMenuColorByTheme } from '@/utils/menu-colors'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { ListItem } from '@/components/ui/navigation-menu-item'
import { AppOptionsDrawer } from '@/components/shared/app-options-drawer'
import { ConnectionStatusIndicator } from '@/components/shared/connection-status-indicator'
import { HeaderMemoryMonitor } from '@/components/shared/header-memory-monitor'
import { ModeToggle } from '@/components/shared/theme-toggle'
import UserNav from '@/components/shared/user-nav'
import { VersionModal } from '@/components/shared/version-modal'
import { useSidebar } from '@/hooks/use-sidebar'
type NavButtonProps = {
  to: string
  className?: string
  children: React.ReactNode
  onBeforeClick?: () => void
  hardNavigate?: boolean
}

/** Para area-comum/tabelas e area-clinica/processo-clinico usa reload (como area-comum); resto usa navigate(). */
const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
function NavButton(
  { to, className, children, onBeforeClick, hardNavigate }: NavButtonProps,
  ref
) {
  const navigate = useNavigate()
  const useHard = hardNavigate ?? (isTabelasPath(to) || isProcessoClinicoPath(to))
  return (
    <button
      type='button'
      className={className}
      ref={ref}
      onClick={() => {
        onBeforeClick?.()
        if (useHard) {
          window.location.href = window.location.origin + to
          return
        }
        navigate(to)
      }}
    >
      {children}
    </button>
  )
})

export function HeaderNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentMenu, setCurrentMenu } = useHeaderNav()
  const menuItems = useHeaderMenu(currentMenu) as MenuItem[]
  const roleId = useAuthStore((state) => state.roleId)
  const role = roleId?.toLowerCase()
  const { hasPermission } = usePermissionsStore()
  const { windows, minimizeWindow } = useWindowsStore()
  const { iconTheme } = useTheme()
  const [inlineHeaderSubmenu, setInlineHeaderSubmenu] = React.useState<{
    parentHref: string
    item: MenuItem
  } | null>(null)
  const [openMenuItem, setOpenMenuItem] = React.useState<string | undefined>(
    undefined
  )
  const [isVersionModalOpen, setIsVersionModalOpen] = React.useState(false)
  const sidebarOpenContext = useSidebarOpen()
  const [openSubmenuIndex, setOpenSubmenuIndex] = React.useState<number | null>(null)
  useSidebar()

  // Ensure NavigationMenu is always controlled by using empty string instead of undefined
  // This prevents the "uncontrolled to controlled" warning
  const controlledValue = openMenuItem ?? ''

  const getIconThemeColor = React.useCallback(
    (path: string) =>
      iconTheme === 'theme-color'
        ? 'bg-primary'
        : getMenuColorByTheme(path, iconTheme),
    [iconTheme]
  )

  const hasItemPermission = (item: MenuItem): boolean => {
    if (item.funcionalidadeId) {
      return hasPermission(item.funcionalidadeId, 'AuthVer')
    }
    return true
  }

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

        return isDirectMatch || hasNestedMatch
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

  /** Como no CliCloud.ASPcli: abrir listagem como tab em baixo ao 1.º clique. */
  const handleDropdownItemClick = (
    e: React.MouseEvent,
    href: string,
    openInNewTab?: boolean,
    _label?: string
  ) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      return
    }
    if (openInNewTab) {
      e.preventDefault()
      window.open(`${window.location.origin}${href}`, '_blank', 'noopener,noreferrer')
      return
    }
    // Para listagens, deixar o <Link> tratar da navegação normal.
  }

  const handleLogoClick = () => {
    // Reset navigation state when clicking the logo
    setCurrentMenu('dashboard')
    // Minimize all windows and clear active window since dashboard is not managed as a window
    windows.forEach((window) => {
      if (!window.isMinimized) {
        minimizeWindow(window.id)
      }
    })
    useWindowsStore.setState({ activeWindow: null })
    // Navigate to dashboard
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
              {/* <Logo width={95} className='text-primary' disableLink={true} /> */}
            </div>
            {/* Hamburger: visível em ecrãs &lt; 1515px; abre a sidebar existente (MobileSidebar) */}
            <Button
              variant='ghost'
              size='icon'
              className='min-[1515px]:hidden h-9 w-9 '
              aria-label='Abrir menu de navegação'
              onClick={() => sidebarOpenContext?.setSidebarOpen(true)}
            >
              <Menu className='h-5 w-5' />
            </Button>
          </div>
          {/* Navegação horizontal: visível a partir de 1515px; abaixo disso só hambúrguer */}
          <div className='hidden min-w-0 flex-1 items-center justify-start min-[1515px]:flex min-[1515px]:gap-3'>
          {(currentMenu === 'tabelas' || currentMenu === 'processo-clinico') ? (
            <nav className='flex flex-wrap items-center gap-6 px-2 py-1.5'>
              {currentMenu === 'tabelas' ? (
                filteredMenuItems.map((item, index) => {
                  const hasSubItems = item.items && item.items.length > 0
                  if (hasSubItems) {
                    return (
                      <DropdownMenu key={index} modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className={cn(
                              'h-auto px-3 py-2 text-sm font-medium rounded-md transition-colors',
                              'text-foreground/90 hover:bg-accent/80 hover:text-accent-foreground',
                              isItemActive(item.href, item.items) &&
                                'bg-accent text-accent-foreground font-semibold'
                            )}
                          >
                            {item.label}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='start'
                          side='bottom'
                          sideOffset={4}
                          className='min-w-0 p-0 relative overflow-visible'
                        >
                          <div className='relative'>
                            <div className='flex flex-col py-1 w-[270px] shrink-0 px-1'>
                              {(item.items ?? []).map((subItem, subIndex) => {
                                const nestedItems = subItem.items ?? subItem.dropdown ?? []
                                const hasNestedItems = nestedItems.length > 0
                                if (hasNestedItems) {
                                  const isSubmenuOpen = openSubmenuIndex === subIndex
                                  const nested = nestedItems as { label: string; href: string }[]
                                  return (
                                    <div key={subIndex} className='relative'>
                                      <button
                                        type='button'
                                        role='menuitem'
                                        className={cn(
                                          'w-full flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left',
                                          (location.pathname === subItem.href ||
                                            nested.some(
                                              (n) =>
                                                location.pathname === n.href ||
                                                location.pathname.startsWith(n.href + '/')
                                            )) &&
                                            'bg-accent text-accent-foreground',
                                          isSubmenuOpen && 'bg-accent text-accent-foreground'
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setOpenSubmenuIndex(
                                            openSubmenuIndex === subIndex ? null : subIndex
                                          )
                                        }}
                                      >
                                        <span className='flex-1 text-left'>{subItem.label}</span>
                                        <span className='ml-2 h-4 w-4 shrink-0 opacity-50' aria-hidden>›</span>
                                      </button>
                                      {isSubmenuOpen && (
                                        <div
                                          className='absolute left-full top-0 ml-0 z-10 min-w-0 w-max'
                                          style={{ height: 'fit-content' }}
                                        >
                                          <div className='border border-border py-1.5 px-1 rounded-md bg-popover shadow-md'>
                                            {nested.map((nestedItem, nestedIndex) => (
                                              <NavButton
                                                key={nestedIndex}
                                                to={nestedItem.href}
                                                className={cn(
                                                  'w-full cursor-pointer block whitespace-nowrap rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none text-left',
                                                  (location.pathname === nestedItem.href ||
                                                    location.pathname.startsWith(
                                                      nestedItem.href + '/'
                                                    )) &&
                                                    'bg-accent text-accent-foreground'
                                                )}
                                                onBeforeClick={() => {
                                                  setOpenSubmenuIndex(null)
                                                  if (nestedItem.href !== location.pathname) {
                                                    usePagesStore
                                                      .getState()
                                                      .resetPageState(location.pathname)
                                                  }
                                                }}
                                              >
                                                {nestedItem.label}
                                              </NavButton>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                }
                                return (
                                  <DropdownMenuItem key={subIndex} asChild>
                                    <NavButton
                                      to={subItem.href}
                                      className={cn(
                                        'w-full cursor-pointer flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left',
                                        (location.pathname === subItem.href ||
                                          location.pathname.startsWith(
                                            subItem.href + '/'
                                          )) &&
                                          'bg-accent text-accent-foreground'
                                      )}
                                      onBeforeClick={() => {
                                        if (subItem.href !== location.pathname) {
                                          usePagesStore
                                            .getState()
                                            .resetPageState(location.pathname)
                                        }
                                      }}
                                    >
                                      {subItem.label}
                                    </NavButton>
                                  </DropdownMenuItem>
                                )
                              })}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }
                  return (
                    <Link
                      key={index}
                      to={item.href}
                      className={cn(
                        'text-sm font-medium px-3 py-2 rounded-md transition-colors',
                        'text-foreground/90 hover:bg-accent/80 hover:text-accent-foreground',
                        location.pathname === item.href &&
                          'bg-accent text-accent-foreground font-semibold'
                      )}
                      onClick={(e) => handleDropdownItemClick(e, item.href, item.openInNewTab, item.label)}
                    >
                      {item.label}
                    </Link>
                  )
                })
              ) : (
                filteredMenuItems.map((item, index) => {
                  const filteredSubItems =
                    item.items?.filter(hasItemPermission) || []
                  if (!item.items?.length || filteredSubItems.length === 0) {
                    return null
                  }
                  return (
                    <DropdownMenu key={index}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className={cn(
                            'h-auto px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            'text-foreground/90 hover:bg-accent/80 hover:text-accent-foreground',
                            isItemActive(item.href, item.items) &&
                              'bg-accent text-accent-foreground font-semibold'
                          )}
                        >
                          {item.label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='start'
                        side='bottom'
                        sideOffset={4}
                        className='min-w-[200px]'
                      >
                        {filteredSubItems.map((subItem, subIndex) => (
                          <DropdownMenuItem key={subIndex} asChild>
                            <NavButton
                              to={subItem.href}
                              className={cn(
                                'cursor-pointer flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                (location.pathname === subItem.href ||
                                  location.pathname.startsWith(subItem.href + '/')) &&
                                  'bg-accent text-accent-foreground'
                              )}
                            >
                              {subItem.label}
                            </NavButton>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })
              )}
            </nav>
          ) : (
            <NavigationMenu
              value={controlledValue}
              onValueChange={(value) => {
                if (value === undefined || value === '') {
                  setOpenMenuItem('')
                  setInlineHeaderSubmenu(null)
                } else {
                  setOpenMenuItem(value)
                  setInlineHeaderSubmenu(null)
                }
              }}
            >
              <NavigationMenuList>
                {filteredMenuItems.map((item, index) => {
                  const filteredSubItems =
                    item.items?.filter(hasItemPermission) || []
                  if (item.items && filteredSubItems.length === 0) {
                    return null
                  }
                  return (
                    <NavigationMenuItem key={index} value={item.href}>
                      {item.items ? (
                        <>
                          <NavigationMenuTrigger
                            triggerMode='click'
                            className={cn(
                              isItemActive(item.href, item.items) &&
                                'bg-accent text-accent-foreground'
                            )}
                            onClick={() => {
                              handleMenuItemClick(true)
                              if (openMenuItem === item.href) {
                                setOpenMenuItem('')
                                setInlineHeaderSubmenu(null)
                              } else {
                                setOpenMenuItem(item.href)
                                setInlineHeaderSubmenu(null)
                              }
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              {item.icon && Icons[item.icon] && (
                                <span
                                  className={`h-5 w-5 p-0.5 rounded flex items-center justify-center ${getIconThemeColor(item.href)}`}
                                >
                                  {React.createElement(
                                    Icons[item.icon] as React.ComponentType<any>,
                                    {
                                      className: 'h-3 w-3 text-white',
                                    }
                                  )}
                                </span>
                              )}
                              {item.label}
                            </div>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            {inlineHeaderSubmenu &&
                            inlineHeaderSubmenu.parentHref === item.href ? (
                              <div className='md:w-[400px] lg:w-[500px]'>
                                <div className='flex items-center justify-between px-4 pt-4 pb-2'>
                                  <button
                                    type='button'
                                    className='text-xs text-muted-foreground hover:text-foreground'
                                    onClick={() => setInlineHeaderSubmenu(null)}
                                  >
                                    ← Voltar
                                  </button>
                                  <div className='text-sm font-semibold'>
                                    {inlineHeaderSubmenu.item.label}
                                  </div>
                                </div>
                                <ul className='grid gap-3 p-4 pt-2 lg:grid-cols-[.75fr_1fr]'>
                                  {(inlineHeaderSubmenu.item.dropdown || []).map(
                                    (dropdownItem, dropdownIndex) => (
                                      <ListItem
                                        key={dropdownIndex}
                                        title={dropdownItem.label}
                                        to={dropdownItem.href}
                                        icon={
                                          dropdownItem.icon as keyof typeof Icons
                                        }
                                        className={cn(
                                          isItemActive(dropdownItem.href) &&
                                            'bg-accent text-accent-foreground'
                                        )}
                                        onClick={(e) => {
                                          setOpenMenuItem('')
                                          setInlineHeaderSubmenu(null)
                                          handleDropdownItemClick(
                                            e,
                                            dropdownItem.href,
                                            dropdownItem.openInNewTab,
                                            dropdownItem.label ?? dropdownItem.description
                                          )
                                        }}
                                      >
                                        <div className='flex items-center'>
                                          {dropdownItem.description}
                                        </div>
                                      </ListItem>
                                    )
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <ul className='grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                                {filteredSubItems.map((subItem, subIndex) => {
                                  const activeState = subItem.dropdown?.length
                                    ? subItem.dropdown.some((dropdownItem) => {
                                        const childHref = dropdownItem.href
                                        return (
                                          location.pathname === childHref ||
                                          location.pathname.startsWith(
                                            childHref + '/'
                                          )
                                        )
                                      })
                                    : isItemActive(subItem.href)

                                  return (
                                    <ListItem
                                      key={subIndex}
                                      title={subItem.label}
                                      to={subItem.href}
                                      icon={subItem.icon as keyof typeof Icons}
                                      hasMoreOptions={!!subItem.dropdown?.length}
                                      className={cn(
                                        activeState &&
                                          'bg-accent text-accent-foreground'
                                      )}
                                      onClick={(e) => {
                                        if (subItem.dropdown?.length) {
                                          e.preventDefault()
                                          setInlineHeaderSubmenu({
                                            parentHref: item.href,
                                            item: subItem,
                                          })
                                          return
                                        }
                                          handleDropdownItemClick(
                                            e,
                                            subItem.href,
                                            subItem.openInNewTab,
                                            subItem.label
                                        )
                                        setOpenMenuItem('')
                                        setInlineHeaderSubmenu(null)
                                      }}
                                    >
                                      <div className='flex items-center'>
                                        {subItem.description}
                                      </div>
                                    </ListItem>
                                  )
                                })}
                              </ul>
                            )}
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <NavButton
                            to={item.href}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              'flex items-center gap-2',
                              isItemActive(item.href) &&
                                'bg-accent text-accent-foreground'
                            )}
                          >
                            {item.icon && Icons[item.icon] && (
                              <span
                                className={`h-5 w-5 p-0.5 rounded flex items-center justify-center ${getIconThemeColor(item.href)}`}
                              >
                                {React.createElement(
                                  Icons[item.icon] as React.ComponentType<any>,
                                  {
                                    className: 'h-3 w-3 text-white',
                                  }
                                )}
                              </span>
                            )}
                            {item.label}
                          </NavButton>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          </div>
          <div className='ml-auto flex flex-shrink-0 items-center gap-1 sm:gap-2'>
            <ConnectionStatusIndicator />
            <AppOptionsDrawer />
            <Button
              variant='outline'
              size='icon'
              onClick={() => setIsVersionModalOpen(true)}
              className='h-8 w-8 transition-all duration-150 hover:scale-105 active:scale-95 sm:h-9 sm:w-9'
              title='Ver versões'
            >
              <Icons.help className='h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]' />
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
