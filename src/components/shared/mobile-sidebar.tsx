import { Dispatch, SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeaderNav } from '@/contexts/header-nav-context'
import { useMenuItemsWithHeaderSubmenus } from '@/hooks/use-menu-items'
import { useWindowsStore } from '@/stores/use-windows-store'
import { cn } from '@/lib/utils'
import { DashboardNav } from '@/components/shared/dashboard-nav'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { HeaderMemoryMonitor } from './header-memory-monitor'
import { ModeToggle } from './theme-toggle'
import UserNav from './user-nav'

type TMobileSidebarProps = {
  className?: string
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  sidebarOpen: boolean
}

export default function MobileSidebar({
  className,
  setSidebarOpen,
  sidebarOpen,
}: TMobileSidebarProps) {
  const menuItems = useMenuItemsWithHeaderSubmenus()
  const navigate = useNavigate()
  const { setActiveMenuItem, setCurrentMenu } = useHeaderNav()
  const { windows, minimizeWindow } = useWindowsStore()

  const handleLogoClick = () => {
    setActiveMenuItem(null)
    setCurrentMenu('dashboard')
    windows.forEach((window) => {
      if (!window.isMinimized) {
        minimizeWindow(window.id)
      }
    })
    useWindowsStore.setState({ activeWindow: null })
    setSidebarOpen(false)
    navigate('/')
  }

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side='left'
        className={cn(
          'w-[340px] max-w-[92vw] p-0',
          'bg-background dark:bg-background',
          'border-r border-border/50 shadow-lg',
          className
        )}
      >
        <SheetHeader className='sr-only'>
          <SheetTitle>Menu de navegação</SheetTitle>
          <SheetDescription>
            Menu de navegação principal em dispositivos móveis
          </SheetDescription>
        </SheetHeader>

        <div className='flex h-full flex-col'>
          {/* Header com logo, alinhado com a sidebar desktop */}
          <div className='border-b border-border/40 bg-background/80 dark:bg-background/60'>
            <div className='flex h-14 items-center px-3'>
              <button
                type='button'
                className='flex items-center gap-2 transition-opacity hover:opacity-80'
                onClick={handleLogoClick}
                aria-label='Ir para início'
              >
                <img
                  src='/CliCloudLogo.png'
                  alt='CliCloud'
                  className='h-9 w-[100px] object-contain'
                />
              </button>
            </div>
          </div>

          {/* Conteúdo de navegação: mais espaço para texto (menos padding) */}
          <div className='flex-1 overflow-y-auto mobile-sidebar-nav'>
            <div className='space-y-0.5 px-2 py-2'>
              <DashboardNav items={menuItems} setOpen={setSidebarOpen} />
            </div>
          </div>

          {/* Footer com utilizador, memória e tema */}
          <div className='border-t border-border/40 bg-background/80 dark:bg-background/60 p-3'>
            <div className='flex items-center justify-between'>
              <UserNav />
              <div className='flex items-center space-x-2'>
                <HeaderMemoryMonitor />
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

