import { useEffect, Suspense, memo, useState, useRef, useCallback } from 'react'
import { utilitariosRoutes } from '@/routes/base/utilitarios-routes'
import { reportsRoutes } from '@/routes/reports/reports-routes'
import { X, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMapStore } from '@/stores/use-map-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useWindowsStore, type WindowState } from '@/stores/use-windows-store'
import { cn } from '@/lib/utils'
import {
  cleanupWindowForms,
  truncateWindowTitle,
  generateInstanceId,
  clearAllWindowData,
  shouldManageWindow,
} from '@/utils/window-utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

interface WindowManagerProps {
  children: React.ReactNode
}

const Window = memo(
  ({
    window,
    isActive,
    children,
  }: {
    window: WindowState
    isActive: boolean
    children: React.ReactNode
  }) => {
    const { getCachedContent, setCachedContent } = useWindowsStore()
    const cachedContent = getCachedContent(window.id)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isContentReady, setIsContentReady] = useState(false)

    useEffect(() => {
      if (isActive && !cachedContent) {
        setCachedContent(window.id, children)
      }
    }, [window.id, isActive, children, cachedContent])

    useEffect(() => {
      if (isActive) {
        setIsTransitioning(true)
        setIsContentReady(false)
        const timer = setTimeout(() => {
          setIsTransitioning(false)
          setTimeout(() => {
            setIsContentReady(true)
          }, 100)
        }, 300)
        return () => clearTimeout(timer)
      } else {
        setIsContentReady(false)
      }
    }, [isActive])

    if (window.isMinimized) {
      return null
    }

    return (
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          isActive
            ? 'visible opacity-100'
            : 'invisible pointer-events-none opacity-0'
        )}
        style={{ zIndex: isActive ? 1 : -1 }}
      >
        <Suspense fallback={<WindowLoadingState />}>
          {isTransitioning || !isContentReady ? (
            <WindowLoadingState />
          ) : (
            <div className='fade-in'>{cachedContent || children}</div>
          )}
        </Suspense>
      </div>
    )
  }
)

Window.displayName = 'Window'

const WindowTab = memo(
  ({
    window,
    isActive,
    onRestore,
    onMinimize,
    onRemove,
    windowIndex,
  }: {
    window: WindowState
    isActive: boolean
    onRestore: (window: WindowState) => void
    onMinimize: (windowId: string) => void
    onRemove: (windowId: string, windowPath: string) => void
    windowIndex: number
  }) => {
    return (
      <div className='relative group' data-window-id={window.id}>
        <Button
          variant={
            window.isMinimized ? 'outline' : isActive ? 'default' : 'outline'
          }
          size='sm'
          onClick={() => {
            if (window.isMinimized || !isActive) {
              onRestore(window)
            } else {
              onMinimize(window.id)
            }
          }}
          className='pr-8'
        >
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'text-[10px] font-medium',
                window.isMinimized ? 'text-primary' : 'text-primary-foreground'
              )}
            >
              {windowIndex + 1}
            </div>
            {window.hasFormData && (
              <div className='h-2 w-2 rounded-full bg-destructive' />
            )}
            {window.title}
          </div>
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-0 top-0 h-full w-6 rounded-l-none hover:bg-destructive hover:text-destructive-foreground'
          onClick={(e) => {
            e.stopPropagation()
            onRemove(window.id, window.path)
          }}
        >
          <X className='h-3 w-3' />
        </Button>
      </div>
    )
  }
)

WindowTab.displayName = 'WindowTab'

const WindowLoadingState = () => (
  <div className='flex h-full w-full items-center justify-center'>
    <div className='flex flex-col items-center gap-4'>
      <div className='relative'>
        <div className='w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20'>
          <Icons.settings className='h-8 w-8 text-primary animate-spin' />
        </div>
        <div className='absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping'></div>
      </div>
      <div className='text-center'>
        <p className='text-sm font-medium text-foreground mb-1'>
          A carregar página...
        </p>
        <p className='text-xs text-muted-foreground'>Por favor aguarde</p>
      </div>
      <div className='flex gap-1'>
        <div className='w-2 h-2 bg-primary rounded-full animate-bounce'></div>
        <div
          className='w-2 h-2 bg-primary rounded-full animate-bounce'
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className='w-2 h-2 bg-primary rounded-full animate-bounce'
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  </div>
)

function findRouteWithManageWindow(pathname: string) {
  const allRoutes = [...utilitariosRoutes, ...reportsRoutes]
  const normalized = pathname.replace(/^\//, '')

  const matchingRoute = allRoutes.find(
    (route) => route.path === normalized && route.manageWindow
  )
  if (matchingRoute) {
    return {
      label: matchingRoute.windowName || matchingRoute.path,
      manageWindow: true,
    }
  }

  if (pathname === '/area-clinica/processo-clinico') {
    return null
  }

  if (pathname === '/area-comum/tabelas') {
    return null
  }
 
  if (shouldManageWindow(pathname)) {
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ''
    const pretty =
      lastSegment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Janela'
    return { label: pretty, manageWindow: true }
  }

  return null
}

export function WindowManager({ children }: WindowManagerProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMinimized } = useSidebar()
  const windowsBarRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const animationFrameRef = useRef<number>(0)
  const momentumRef = useRef<number>(0)

  const {
    windows,
    activeWindow,
    addWindow,
    minimizeWindow,
    restoreWindow,
    removeWindow,
  } = useWindowsStore()
  const mapStore = useMapStore.getState()

  const checkScrollButtons = useCallback(() => {
    if (!windowsBarRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = windowsBarRef.current
    const threshold = 1
    setShowLeftArrow(scrollLeft > threshold)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold)
  }, [])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      if (!windowsBarRef.current) return
      const scrollAmount = 200
      const currentScroll = windowsBarRef.current.scrollLeft
      const containerWidth = windowsBarRef.current.clientWidth
      const totalWidth = windowsBarRef.current.scrollWidth

      let targetScroll: number
      if (direction === 'left') {
        targetScroll = Math.max(0, currentScroll - scrollAmount)
        if (targetScroll < scrollAmount) targetScroll = 0
      } else {
        targetScroll = Math.min(
          totalWidth - containerWidth,
          currentScroll + scrollAmount
        )
      }
      windowsBarRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' })
    },
    []
  )

  // Scroll listeners
  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [checkScrollButtons])

  useEffect(() => {
    const el = windowsBarRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollButtons)
      return () => el.removeEventListener('scroll', checkScrollButtons)
    }
  }, [checkScrollButtons])

  // Auto-scroll para a tab ativa
  useEffect(() => {
    if (!windowsBarRef.current || !activeWindow) return
    const activeEl = windowsBarRef.current.querySelector(
      `[data-window-id="${activeWindow}"]`
    )
    if (!activeEl) return

    const containerRect = windowsBarRef.current.getBoundingClientRect()
    const elementRect = activeEl.getBoundingClientRect()

    if (
      elementRect.left < containerRect.left ||
      elementRect.right > containerRect.right
    ) {
      const targetScroll =
        windowsBarRef.current.scrollLeft +
        elementRect.left -
        containerRect.left -
        containerRect.width / 2 +
        elementRect.width / 2
      const maxScroll =
        windowsBarRef.current.scrollWidth - containerRect.width
      requestAnimationFrame(() => {
        windowsBarRef.current?.scrollTo({
          left: Math.max(0, Math.min(targetScroll, maxScroll)),
          behavior: 'smooth',
        })
      })
    }
  }, [activeWindow])

  // ─── EFEITO PRINCIPAL: criar / ativar janela com base na rota ──────────
  // Dependências: APENAS location.pathname e location.search.
  // Lemos windows diretamente do store (getState) para evitar que uma
  // mudança em windows re-dispare este efeito e crie duplicados.
  useEffect(() => {
    const route = findRouteWithManageWindow(location.pathname)
    if (!route?.manageWindow) return

    const urlParams = new URLSearchParams(location.search)
    const filters: Record<string, string> = {}
    urlParams.forEach((value, key) => {
      if (key !== 'instanceId') filters[key] = value
    })

    // Ler windows sempre do store (nunca da closure React)
    const storeState = useWindowsStore.getState()
    const currentWindows = storeState.windows
    const existingByPath = currentWindows.find(
      (w) => w.path === location.pathname
    )

    if (existingByPath) {
      // Tab já existe – ativar e sincronizar instanceId na URL
      if (storeState.activeWindow !== existingByPath.id) {
        restoreWindow(existingByPath.id)
      }
      const currentInstanceInUrl = urlParams.get('instanceId')
      if (currentInstanceInUrl !== existingByPath.instanceId) {
        const newSearch = new URLSearchParams(filters)
        newSearch.set('instanceId', existingByPath.instanceId)
        navigate(`${location.pathname}?${newSearch.toString()}`, {
          replace: true,
        })
      }
      return
    }

    // Criar nova janela
    const instanceId = urlParams.get('instanceId') || generateInstanceId()
    const id = generateInstanceId()
    const parentWindowId = sessionStorage.getItem(
      `parent-window-${instanceId}`
    )

    addWindow({
      id,
      instanceId,
      title: truncateWindowTitle(route.label),
      path: location.pathname,
      hasFormData: false,
      searchParams: filters,
      parentWindowId: parentWindowId || undefined,
    })

    usePagesStore.getState().setPageStateByWindowId(id, {
      windowId: id,
      pathname: location.pathname,
      searchParams: filters,
      filters: [],
      sorting: [],
      pagination: { page: 1, pageSize: 10 },
      columnVisibility: {},
      selectedRows: [],
      modalStates: {},
    })

    if (!urlParams.get('instanceId')) {
      const newSearch = new URLSearchParams(filters)
      newSearch.set('instanceId', instanceId)
      navigate(`${location.pathname}?${newSearch.toString()}`, {
        replace: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Limpar page state de janelas que já não existem
  useEffect(() => {
    const pagesStore = usePagesStore.getState()
    const currentPages = Object.keys(pagesStore.pages)
    const openWindowIds = new Set(windows.map((w) => w.id))

    currentPages.forEach((pageId) => {
      const ps = pagesStore.pages[pageId]
      if (ps.windowId && !openWindowIds.has(ps.windowId)) {
        pagesStore.removePageStateByWindowId(ps.windowId)
      }
    })
  }, [windows])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleRestoreWindow = useCallback(
    (win: WindowState) => {
      restoreWindow(win.id)
      const searchParams = new URLSearchParams()
      if (win.searchParams) {
        Object.entries(win.searchParams).forEach(([k, v]) =>
          searchParams.set(k, v)
        )
      }
      searchParams.set('instanceId', win.instanceId)
      navigate(`${win.path}?${searchParams.toString()}`)
    },
    [restoreWindow, navigate]
  )

  const handleRemoveWindow = useCallback(
    (windowId: string, windowPath: string) => {
      removeWindow(windowId)

      const pagesStore = usePagesStore.getState()
      pagesStore.removePageStateByWindowId(windowId)
      mapStore.cleanupWindowData(windowId)
      cleanupWindowForms(windowId)

      // Ler remaining windows do store (já actualizado)
      const remaining = useWindowsStore.getState().windows
      if (remaining.length === 0) {
        cleanupWindowForms('*')
        // Navegar para a raiz da área actual
        const targetPath = getAreaRootPath(windowPath)
        clearAllWindowData()
        window.location.href = `${window.location.origin}${targetPath}`
        return
      }

      // Se estamos no path da janela que fechámos, activar a última restante
      if (windowPath === location.pathname) {
        const last = remaining[remaining.length - 1]
        const searchParams = new URLSearchParams()
        if (last.searchParams) {
          Object.entries(last.searchParams).forEach(([k, v]) =>
            searchParams.set(k, v)
          )
        }
        searchParams.set('instanceId', last.instanceId)
        restoreWindow(last.id)
        navigate(`${last.path}?${searchParams.toString()}`)
      }
    },
    [location.pathname, removeWindow, restoreWindow, navigate, mapStore]
  )

  const handleCloseAllWindows = useCallback(() => {
    const targetPath = getAreaRootPath(location.pathname)
    clearAllWindowData()
    cleanupWindowForms('*')
    window.location.href = `${window.location.origin}${targetPath}`
  }, [location.pathname])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!windowsBarRef.current) return
    e.preventDefault()
    const el = windowsBarRef.current
    let target = el.scrollLeft + e.deltaY * 2
    target = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth))
    if (e.deltaY < 0 && target < 10) target = 0
    el.scrollTo({ left: target, behavior: 'smooth' })
  }, [])

  // Cleanup animation frames
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (momentumRef.current) cancelAnimationFrame(momentumRef.current)
    }
  }, [])

  return (
    <div className='relative h-full'>
      <div className='relative h-full'>
        {windows.length > 0 && windows.some((w) => !w.isMinimized) ? (
          windows.map((win) => (
            <Window
              key={win.id}
              window={win}
              isActive={win.id === activeWindow}
            >
              {children}
            </Window>
          ))
        ) : (
          <div className='h-full'>{children}</div>
        )}
      </div>

      {windows.length > 0 && (
        <div className='fixed bottom-0 left-0 right-0 z-[80] pointer-events-none '>
          <div
            className={cn(
              'relative pointer-events-auto',
              isMinimized
                ? 'min-[1515px]:pl-[110px]'
                : 'min-[1515px]:pl-[250px]'
            )}
          >
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className='absolute left-2 top-1/2 z-[60] -translate-y-1/2 rounded-r-lg bg-primary/10 p-2 backdrop-blur-sm hover:bg-primary/20 border border-primary/20 shadow-sm'
              >
                <ChevronLeft className='h-4 w-4 text-primary' />
              </button>
            )}

            <div
              ref={windowsBarRef}
              className='flex gap-2 p-2 bg-background/80 backdrop-blur-sm border-t overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
              onWheel={handleWheel}
            >
              <Button
                variant='outline'
                size='sm'
                onClick={handleCloseAllWindows}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <XCircle className='h-3 w-3' />
              </Button>
              {windows.map((win, index) => (
                <WindowTab
                  key={win.id}
                  window={win}
                  isActive={win.id === activeWindow}
                  onRestore={handleRestoreWindow}
                  onMinimize={(id) => {
                    minimizeWindow(id)
                    navigate('/')
                  }}
                  onRemove={handleRemoveWindow}
                  windowIndex={index}
                />
              ))}
            </div>

            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className='absolute right-2 top-1/2 z-[60] -translate-y-1/2 rounded-l-lg bg-primary/10 p-2 backdrop-blur-sm hover:bg-primary/20 border border-primary/20 shadow-sm'
              >
                <ChevronRight className='h-4 w-4 text-primary' />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Dado um path qualquer, devolve o root da área correspondente
 * para onde navegar quando todas as tabs são fechadas.
 */
function getAreaRootPath(path: string): string {
  const p = path.toLowerCase()
  if (p.startsWith('/area-clinica/processo-clinico')) return '/area-clinica/processo-clinico'
  if (p.startsWith('/area-comum/tabelas')) return '/area-comum/tabelas'
  if (p.startsWith('/utentes')) return '/utentes'
  if (p.startsWith('/reports')) return '/reports'
  if (p.startsWith('/utilitarios')) return '/utilitarios'
  return '/'
}
