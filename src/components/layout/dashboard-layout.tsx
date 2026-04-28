import { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { SidebarOpenProvider, useSidebarOpen } from '@/contexts/sidebar-open-context'
import Header from '@/components/shared/header'
import { HeaderNav } from '@/components/shared/header-nav'
import MobileSidebar from '@/components/shared/mobile-sidebar'
import Sidebar from '@/components/shared/sidebar'
import { WindowManager } from './window-manager'

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarOpen, setSidebarOpen } = useSidebarOpen()!
  const { isMinimized } = useSidebar()

  return (
    <>
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {/* Sidebar fixa: apenas em ecrãs >= 1515px */}
      <div className='fixed left-0 z-30 hidden h-full min-[1515px]:block'>
        <Sidebar />
      </div>
      <div
        className={cn(
          'flex w-full flex-1 flex-col',
          isMinimized
            ? 'min-[1515px]:ml-[110px] min-[1515px]:w-[calc(100%-110px)]'
            : 'min-[1515px]:ml-[250px] min-[1515px]:w-[calc(100%-250px)]'
        )}
      >
        {/* HeaderNav + barra superior: apenas em ecrãs >= 1515px */}
        <div className='fixed left-0 right-0 top-0 z-20 hidden flex-col bg-background min-[1515px]:block'>
          <div
            className={cn(
              'flex w-full min-h-14 flex-col',
              isMinimized
                ? 'min-[1515px]:pl-[110px]'
                : 'min-[1515px]:pl-[250px]'
            )}
          >
            <HeaderNav />
          </div>
        </div>
        {/* Header compacto + botão de hambúrguer: ecrãs < 1515px */}
        <div className='relative z-10 flex min-h-14 flex-shrink-0 items-stretch min-[1515px]:hidden'>
          <button
            type='button'
            className='flex flex-shrink-0 items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary'
            onClick={() => setSidebarOpen(true)}
            aria-label='Abrir menu'
          >
            <MenuIcon className='h-6 w-6' aria-hidden='true' />
          </button>
          <Header />
        </div>
        <main className='relative flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
          {/* Imagem de fundo clínico (apenas nas páginas após login) */}
          <div
            className='fixed inset-0 bg-cover bg-right bg-no-repeat opacity-[0.4] dark:opacity-[0.32] pointer-events-none'
            style={{ backgroundImage: 'url(/assets/media/background-clinical.jpg)' }}
            aria-hidden
          />
          <div
            className='fixed inset-0 bg-background/45 dark:bg-background/58 pointer-events-none'
            aria-hidden
          />
          <div className='relative z-10 min-h-full'>
            <WindowManager>{children}</WindowManager>
          </div>
        </main>
      </div>
    </>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <SidebarOpenProvider value={{ sidebarOpen, setSidebarOpen }}>
      <div className='flex h-screen overflow-hidden bg-secondary'>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </div>
    </SidebarOpenProvider>
  )
}
