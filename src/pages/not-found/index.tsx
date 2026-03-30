import { useRouter } from '@/routes/hooks/use-router'
import { useNavigate } from 'react-router-dom'
import { useMapStore } from '@/stores/use-map-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { cleanupWindowForms } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'

export function NotFound() {
  const router = useRouter()
  const navigate = useNavigate()
  const { windows, activeWindow, restoreWindow, removeWindow } =
    useWindowsStore()

  const handleGoBack = () => {
    // If there are other windows open, navigate to the previous one
    if (windows.length > 1) {
      // Find the previous window by looking at access history
      // Sort windows by lastAccessed time to get the access order
      const sortedWindows = [...windows].sort(
        (a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0)
      )

      // Find the current window in the sorted list
      const currentWindowIndex = sortedWindows.findIndex(
        (w) => w.id === activeWindow
      )

      // Get the previous window (the one accessed before the current one)
      if (currentWindowIndex > 0) {
        const previousWindow = sortedWindows[currentWindowIndex - 1]

        // Restore the previous window
        restoreWindow(previousWindow.id)

        // Navigate to the previous window's path with its instanceId
        const searchParams = new URLSearchParams()
        if (previousWindow.searchParams) {
          Object.entries(previousWindow.searchParams).forEach(
            ([key, value]) => {
              searchParams.set(key, value)
            }
          )
        }
        searchParams.set('instanceId', previousWindow.instanceId)
        navigate(`${previousWindow.path}?${searchParams.toString()}`)
        return
      }
    }

    // Fallback to browser back if no other windows
    router.back()
  }

  const handleGoHome = () => {
    // Remove all windows and clean up their data (same as handleCloseAllWindows)
    windows.forEach((window) => {
      // Remove window from windows store
      removeWindow(window.id)

      // Remove page state for this window
      const pagesStore = usePagesStore.getState()
      pagesStore.removePageStateByWindowId(window.id)

      // Clean up map data for this window
      const mapStore = useMapStore.getState()
      mapStore.cleanupWindowData(window.id)
    })

    // Clean up all form instances
    cleanupWindowForms('*')

    // Navigate to home
    navigate('/')
  }

  return (
    <div className='absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent'>
        404
      </span>
      <h2 className='font-heading my-2 text-2xl font-bold'>
        Página não encontrada
      </h2>
      <p>Desculpe, a página que está a procurar não existe ou foi removida.</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={handleGoBack} variant='default' size='lg'>
          Voltar
        </Button>
        <Button onClick={handleGoHome} variant='ghost' size='lg'>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
