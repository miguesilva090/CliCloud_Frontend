import { useEffect, Suspense, memo, useState, useRef } from 'react'
import { utilitariosRoutes } from '@/routes/base/utilitarios-routes'
import { areaClinicaRoutes } from '@/routes/area-clinica/areaClinica'
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
  getParentWindowInfo as getParentWindowInfoUtil,
  generateInstanceId,
  shouldManageWindow,
} from '@/utils/window-utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

interface WindowManagerProps {
  children: React.ReactNode
}

function normalizeComparablePath(path: string): string {
  if (!path) return '/'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.endsWith('/') && normalized.length > 1
    ? normalized.slice(0, -1)
    : normalized
}

function canReuseInstanceAcrossPaths(
  existingPath: string,
  targetPath: string
): boolean {
  const from = normalizeComparablePath(existingPath)
  const to = normalizeComparablePath(targetPath)

  if (from === to) return true

  // Permite apenas transições hierárquicas da mesma instância
  // (ex.: /utentes/:id -> /utentes/:id/editar), evitando "trocas"
  // entre páginas irmãs como "X" e "Listagem X".
  return from.startsWith(`${to}/`) || to.startsWith(`${from}/`)
}

// Memoized window component to prevent unnecessary re-renders
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
      if (isActive) {
        setCachedContent(window.id, children)
      }
    }, [window.id, isActive, children, setCachedContent])

    useEffect(() => {
      if (isActive) {
        setIsTransitioning(true)
        setIsContentReady(false)
        const timer = setTimeout(() => {
          setIsTransitioning(false)
          // Add a small delay before showing content to ensure smooth transition
          setTimeout(() => {
            setIsContentReady(true)
          }, 100)
        }, 300) // Match the transition duration
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
        style={{
          zIndex: isActive ? 1 : -1,
        }}
      >
        <Suspense fallback={<WindowLoadingState />}>
          {isTransitioning || !isContentReady ? (
            <WindowLoadingState />
          ) : (
            <div className='fade-in'>
              {isActive ? children : cachedContent || children}
            </div>
          )}
        </Suspense>
      </div>
    )
  }
)

Window.displayName = 'Window'

// Component for individual window tab that can use hooks
const WindowTab = memo(
  ({
    window,
    isActive,
    onRestore,
    onMinimize,
    onRemove,
    parentWindowInfo,
    parentWindowNumber,
    windowIndex,
  }: {
    window: WindowState
    isActive: boolean
    onRestore: (window: WindowState) => void
    onMinimize: (windowId: string) => void
    onRemove: (windowId: string, windowPath: string) => void
    parentWindowInfo: { title: string; path: string } | null
    parentWindowNumber: number
    windowIndex: number
  }) => {
    const parentTooltip = window.parentWindowId
      ? parentWindowInfo
        ? `Aberto a partir da janela #${parentWindowNumber}: ${parentWindowInfo.title}`
        : 'Aberto a partir de outra janela'
      : undefined

    return (
      <div
        className='relative group'
        data-window-id={window.id}
        title={parentTooltip}
      >
        <Button
          variant={
            window.isMinimized ? 'outline' : isActive ? 'default' : 'outline'
          }
          size='sm'
          onClick={() => {
            if (window.isMinimized) {
              onRestore(window)
            } else if (!isActive) {
              onRestore(window)
            } else {
              // When clicking on the active window, minimize it and show dashboard
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
      {/* Animated icon */}
      <div className='relative'>
        <div className='w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20'>
          <Icons.settings className='h-8 w-8 text-primary animate-spin' />
        </div>
        {/* Pulsing ring effect */}
        <div className='absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping'></div>
      </div>

      {/* Loading text */}
      <div className='text-center'>
        <p className='text-sm font-medium text-foreground mb-1'>
          A carregar página...
        </p>
        <p className='text-xs text-muted-foreground'>Por favor aguarde</p>
      </div>

      {/* Progress dots */}
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

export function WindowManager({ children }: WindowManagerProps) {
  const { isMinimized } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
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
    updateWindowState,
  } = useWindowsStore()
  const mapStore = useMapStore.getState()

  // Helper function to get parent window information
  const getParentWindowInfo = (parentWindowId: string) => {
    return getParentWindowInfoUtil(parentWindowId, windows)
  }

  const checkScrollButtons = () => {
    if (!windowsBarRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = windowsBarRef.current
    // Use a small threshold to account for floating-point precision and browser scroll behavior
    const threshold = 1
    setShowLeftArrow(scrollLeft > threshold)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!windowsBarRef.current) return
    const scrollAmount = 200 // Adjust this value to control scroll distance
    const currentScroll = windowsBarRef.current.scrollLeft
    const containerWidth = windowsBarRef.current.clientWidth
    const totalWidth = windowsBarRef.current.scrollWidth

    let targetScroll
    if (direction === 'left') {
      // For left scroll, ensure we don't go past the start
      targetScroll = Math.max(0, currentScroll - scrollAmount)
      // If we're close to the left edge, scroll all the way to 0
      if (targetScroll < scrollAmount) {
        targetScroll = 0
      }
    } else {
      // For right scroll, ensure we don't go past the end
      targetScroll = Math.min(
        totalWidth - containerWidth,
        currentScroll + scrollAmount
      )
    }

    windowsBarRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (windowsBarRef.current) {
      windowsBarRef.current.addEventListener('scroll', checkScrollButtons)
      return () => {
        windowsBarRef.current?.removeEventListener('scroll', checkScrollButtons)
      }
    }
  }, [])

  // Add effect to scroll to active window
  useEffect(() => {
    if (!windowsBarRef.current || !activeWindow) return

    const activeWindowElement = windowsBarRef.current.querySelector(
      `[data-window-id="${activeWindow}"]`
    )
    if (activeWindowElement) {
      const containerRect = windowsBarRef.current.getBoundingClientRect()
      const elementRect = activeWindowElement.getBoundingClientRect()

      // Calculate the scroll position needed to center the active window
      const scrollTo = elementRect.left - containerRect.left

      // Get the current scroll position
      const currentScroll = windowsBarRef.current.scrollLeft

      // Calculate the target scroll position to center the window
      const targetScroll =
        currentScroll +
        scrollTo -
        containerRect.width / 2 +
        elementRect.width / 2

      // Ensure we don't scroll past the boundaries
      const maxScroll = windowsBarRef.current.scrollWidth - containerRect.width
      const boundedScroll = Math.max(0, Math.min(targetScroll, maxScroll))

      // Only scroll if the window is not fully visible
      if (
        elementRect.left < containerRect.left ||
        elementRect.right > containerRect.right
      ) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          if (windowsBarRef.current) {
            windowsBarRef.current.scrollTo({
              left: boundedScroll,
              behavior: 'smooth',
            })
          }
        })
      }
    }
  }, [activeWindow])

  // Rotas declaradas com manageWindow + áreas geridas por shouldManageWindow (Área Comum, Processo Clínico, utentes, etc.)
  const findRouteWithManageWindow = (pathname: string) => {
    const normalized = pathname.replace(/^\//, '')
    const allRoutes = [...utilitariosRoutes, ...reportsRoutes, ...areaClinicaRoutes]

    const matchingRoute = allRoutes.find(
      (route) => route.path === normalized && route.manageWindow
    )
    if (matchingRoute) {
      return {
        label: matchingRoute.windowName || matchingRoute.path,
        manageWindow: true,
      }
    }

    if (pathname === '/area-clinica/processo-clinico') return null
    if (pathname === '/area-comum/tabelas') return null

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

  useEffect(() => {
    const route = findRouteWithManageWindow(location.pathname)
    if (!route?.manageWindow) return

    const searchParams = new URLSearchParams(location.search)
    const hadInstanceInUrl = searchParams.has('instanceId')
    const filters: Record<string, string> = {}
    const instanceId = searchParams.get('instanceId') || generateInstanceId()

    searchParams.forEach((value, key) => {
      if (key !== 'instanceId') {
        filters[key] = value
      }
    })

    const { findWindowByPathAndInstanceId: findWin, windows: windowsSnapshot } =
      useWindowsStore.getState()

    const exactMatch = findWin(location.pathname, instanceId)
    // Redirect na mesma instância (ex.: /utentes/:id → /utentes/:id/editar) — uma tab só
    const existingWindow =
      exactMatch ??
      (hadInstanceInUrl
        ? windowsSnapshot.find(
            (w) =>
              w.instanceId === instanceId &&
              canReuseInstanceAcrossPaths(w.path, location.pathname)
          )
        : undefined)

    if (!existingWindow) {
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

      const pagesStore = usePagesStore.getState()
      pagesStore.setPageStateByWindowId(id, {
        windowId: id,
        pathname: location.pathname,
        searchParams: filters,
        filters: [],
        sorting: [],
        pagination: {
          page: 1,
          pageSize: 10,
        },
        columnVisibility: {},
        selectedRows: [],
        modalStates: {},
      })

      if (!hadInstanceInUrl) {
        const newSearch = new URLSearchParams()
        Object.entries(filters).forEach(([k, v]) => newSearch.set(k, v))
        newSearch.set('instanceId', instanceId)
        navigate(`${location.pathname}?${newSearch.toString()}`, {
          replace: true,
        })
      }
    } else {
      restoreWindow(existingWindow.id)
      const pathOrParamsChanged =
        existingWindow.path !== location.pathname ||
        JSON.stringify(existingWindow.searchParams ?? {}) !==
          JSON.stringify(filters)

      if (pathOrParamsChanged) {
        updateWindowState(existingWindow.id, {
          path: location.pathname,
          searchParams: filters,
        })
        const pagesStore = usePagesStore.getState()
        pagesStore.setPageStateByWindowId(existingWindow.id, {
          pathname: location.pathname,
          searchParams: filters,
        })
      } else {
        updateWindowState(existingWindow.id, {
          hasFormData: existingWindow.hasFormData,
          searchParams: filters,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Add a new useEffect to clean up page state for closed windows
  useEffect(() => {
    const pagesStore = usePagesStore.getState()
    const currentPages = Object.keys(pagesStore.pages)

    // Get all window IDs from open windows
    const openWindowIds = windows.map((window) => window.id)

    // Remove page state for windows that don't exist anymore
    currentPages.forEach((pageId) => {
      const pageState = pagesStore.pages[pageId]
      if (pageState.windowId && !openWindowIds.includes(pageState.windowId)) {
        pagesStore.removePageStateByWindowId(pageState.windowId)
      }
    })
  }, [windows])

  const handleRestoreWindow = (targetWindow: WindowState) => {
    // Always update the URL with the correct instanceId, even if the path is the same
    const searchParams = new URLSearchParams()
    if (targetWindow.searchParams) {
      Object.entries(targetWindow.searchParams).forEach(([key, value]) => {
        searchParams.set(key, value)
      })
    }
    searchParams.set('instanceId', targetWindow.instanceId)
    const fullPath = `${targetWindow.path}?${searchParams.toString()}`


    navigate(fullPath, { replace: true })
    restoreWindow(targetWindow.id)

    // Scroll to make the window visible if needed
    if (windowsBarRef.current) {
      const windowElement = windowsBarRef.current.querySelector(
        `[data-window-id="${targetWindow.id}"]`
      )
      if (windowElement) {
        const containerRect = windowsBarRef.current.getBoundingClientRect()
        const elementRect = windowElement.getBoundingClientRect()

        // Calculate how close the window is to the edges
        const distanceFromLeft = elementRect.left - containerRect.left
        const distanceFromRight = containerRect.right - elementRect.right
        const containerWidth = containerRect.width

        // Define the edge detection area (30% of container width)
        const edgeArea = containerWidth * 0.3

        let targetScroll = windowsBarRef.current.scrollLeft

        // If window is in the left edge area
        if (distanceFromLeft < edgeArea) {
          // Calculate scroll amount based on how close to the edge
          const scrollAmount = (1 - distanceFromLeft / edgeArea) * 200
          targetScroll = Math.max(0, targetScroll - scrollAmount)
        }
        // If window is in the right edge area
        else if (distanceFromRight < edgeArea) {
          // Calculate scroll amount based on how close to the edge
          const scrollAmount = (1 - distanceFromRight / edgeArea) * 200
          targetScroll = Math.min(
            windowsBarRef.current.scrollWidth - containerWidth,
            targetScroll + scrollAmount
          )
        }

        // Only scroll if the position changed
        if (targetScroll !== windowsBarRef.current.scrollLeft) {
          windowsBarRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  const handleRemoveWindow = (windowId: string, windowPath: string) => {
    // Remove window from windows store
    removeWindow(windowId)

    // Remove page state for this specific window
    const pagesStore = usePagesStore.getState()
    pagesStore.removePageStateByWindowId(windowId)

    // Clean up map data for this window
    mapStore.cleanupWindowData(windowId)

    // Check if this was the last window
    const remainingWindows = windows.filter((w) => w.id !== windowId)
    if (remainingWindows.length === 0) {
      // If it was the last window, clean up all form instances
      cleanupWindowForms('*') // Clean up all form instances
    } else {
      // Otherwise just clean up forms for this specific window
      cleanupWindowForms(windowId)
    }

    if (windowPath === location.pathname) {
      // Find any other open window to navigate to, or go home
      if (remainingWindows.length > 0) {
        const lastWindow = remainingWindows[remainingWindows.length - 1]
        // Add instanceId to the URL if it exists
        const searchParams = new URLSearchParams()
        if (lastWindow.searchParams) {
          Object.entries(lastWindow.searchParams).forEach(([key, value]) => {
            searchParams.set(key, value)
          })
        }
        searchParams.set('instanceId', lastWindow.instanceId)
        const fullPathToShow = `${lastWindow.path}?${searchParams.toString()}`
        navigate(fullPathToShow)
      } else {
        navigate('/')
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!windowsBarRef.current) return
    e.preventDefault()

    const currentScroll = windowsBarRef.current.scrollLeft
    const containerWidth = windowsBarRef.current.clientWidth
    const totalWidth = windowsBarRef.current.scrollWidth

    // Calculate target scroll position
    let targetScroll = currentScroll + e.deltaY * 2

    // Ensure we don't scroll past the boundaries
    targetScroll = Math.max(
      0,
      Math.min(targetScroll, totalWidth - containerWidth)
    )

    // If we're scrolling left and very close to the left edge, snap to exactly 0
    if (e.deltaY < 0 && targetScroll < 10) {
      targetScroll = 0
    }

    // Use smooth scrolling to the target position
    windowsBarRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  const handleCloseAllWindows = () => {
    // Remove all windows and clean up their data
    windows.forEach((window) => {
      // Remove window from windows store
      removeWindow(window.id)

      // Remove page state for this window
      const pagesStore = usePagesStore.getState()
      pagesStore.removePageStateByWindowId(window.id)

      // Clean up map data for this window
      mapStore.cleanupWindowData(window.id)

    })

    // Clean up all form instances
    cleanupWindowForms('*')

    // Navigate to home
    navigate('/')
  }

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current)
      }
    }
  }, [])

  return (
    <div className='relative h-full'>
      {/* Windows Container */}
      <div className='relative h-full'>
        {windows.length > 0 &&
        windows.some((window) => !window.isMinimized) &&
        shouldManageWindow(location.pathname) ? (
          windows.map((window) => (
            <Window
              key={window.id}
              window={window}
              isActive={window.id === activeWindow}
            >
              {children}
            </Window>
          ))
        ) : (
          // Rotas sem manageWindow (ex.: hub processo clínico, /) mostram o Outlet aqui;
          // caso contrário, com tabs abertas, o conteúdo ficava preso à janela "activa" errada.
          <div className='h-full'>{children}</div>
        )}
      </div>

      {/* Windows Bar - Only show when there are windows */}
      {windows.length > 0 && (
        <div
          className={cn(
            'fixed bottom-0 right-0 z-50',
            // Alinhar à área de conteúdo (sidebar fixa só em >=1515px; ver dashboard-layout)
            isMinimized
              ? 'left-0 min-[1515px]:left-[110px]'
              : 'left-0 min-[1515px]:left-[260px]'
          )}
        >
          <div className='relative'>
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
              {windows.map((window, index) => {
                const parentInfo = window.parentWindowId
                  ? getParentWindowInfo(window.parentWindowId)
                  : null
                const parentWindowIndex = window.parentWindowId
                  ? windows.findIndex((w) => w.id === window.parentWindowId)
                  : -1
                const parentWindowNumber = parentWindowIndex + 1

                return (
                  <WindowTab
                    key={window.id}
                    window={window}
                    isActive={window.id === activeWindow}
                    onRestore={handleRestoreWindow}
                    onMinimize={(windowId) => {
                      minimizeWindow(windowId)
                      navigate('/')
                    }}
                    onRemove={handleRemoveWindow}
                    parentWindowInfo={parentInfo}
                    parentWindowNumber={parentWindowNumber}
                    windowIndex={index}
                  />
                )
              })}
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
