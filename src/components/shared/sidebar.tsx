'use client'

import { useHeaderNav } from '@/contexts/header-nav-context'
import { ChevronsLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { cn } from '@/lib/utils'
import { useMenuItems } from '@/hooks/use-menu-items'
import { useSidebar } from '@/hooks/use-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DashboardNav } from '@/components/shared/dashboard-nav'

type SidebarProps = {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar()
  const menuItems = useMenuItems()
  const navigate = useNavigate()
  const { setActiveMenuItem, setCurrentMenu } = useHeaderNav()
  const { windows, minimizeWindow } = useWindowsStore()

  const handleLogoClick = () => {
    // Reset navigation state when clicking the logo
    setActiveMenuItem(null)
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
    <nav
      className={cn(
        'relative z-10 hidden h-screen flex-none',
        'bg-muted/40 dark:bg-muted/20 backdrop-blur-xl',
        'border-r border-border/50',
        'shadow-sm',
        'md:block transition-all duration-300 ease-in-out',
        !isMinimized ? 'w-68' : 'w-68',
        className
      )}
    >
      {/* Header: logo + minimizar */}
      <div
        className={cn(
          'flex h-16 items-center',
          isMinimized ? 'justify-center' : 'justify-between',
          'transition-all duration-300',
          'border-b border-border/40',
          !isMinimized ? 'px-4' : 'px-0',
          'bg-background/80 dark:bg-background/60'
        )}
      >
        <div
          className={cn(
            'flex items-center',
            'transition-all duration-300',
            isMinimized
              ? [
                  'cursor-pointer',
                  'w-full',
                  'hover:bg-primary/10',
                  'active:bg-primary/15',
                  'flex justify-center',
                  'py-2',
                ]
              : [
                  'cursor-pointer',
                  'hover:opacity-90',
                  'transition-opacity',
                  'rounded-lg',
                  'group',
                ]
          )}
          onClick={isMinimized ? toggle : handleLogoClick}
          role='button'
          aria-label={isMinimized ? 'Expand sidebar' : 'Ir para início'}
        >
          <img
            src='/CliCloudLogo.png'
            alt='CliCloud'
            className={cn(
              'object-contain transition-all duration-300',
              isMinimized ? 'h-9 w-auto' : 'h-9 w-[100px]',
              isMinimized
                ? 'scale-90 opacity-90 hover:scale-100 hover:opacity-100'
                : 'group-hover:scale-[0.98] group-hover:opacity-90'
            )}
          />
        </div>
        {!isMinimized && (
          <button
            type='button'
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-lg',
              'border border-border bg-background/80',
              'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
              'transition-all duration-200 hover:scale-105 active:scale-95'
            )}
            onClick={toggle}
            aria-label='Recolher sidebar'
          >
            <ChevronsLeft className='size-4' />
          </button>
        )}
      </div>

      <ScrollArea
        className={cn('h-[calc(100vh-4rem)]', 'transition-all duration-300')}
      >
        <div className={cn('space-y-1 py-3', !isMinimized ? 'px-2' : 'px-0')}>
          <div className='space-y-1'>
            <DashboardNav items={menuItems} />
          </div>
        </div>
      </ScrollArea>
    </nav>
  )
}
