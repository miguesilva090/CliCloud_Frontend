import { usePagesStore } from '../stores/use-pages-store'
import { useWindowsStore } from '../stores/use-windows-store'

/**
 * Synchronizes the pages store with the windows store.
 * This ensures that only pages with active windows are kept in the pages store.
 */
export const syncStores = () => {
  const pagesStore = usePagesStore.getState()
  // const windowsStore = useWindowsStore.getState()

  // Get all active window IDs
  // const activeWindowIds = windowsStore.windows.map((w) => w.id)

  // Clean up orphaned page states
  pagesStore.cleanupOrphanedPageStates()
}

/**
 * Sets up event listeners to keep the stores in sync.
 * This should be called when the application initializes.
 */
export const setupStoreSync = () => {
  // Subscribe to window store changes
  const unsubscribe = useWindowsStore.subscribe(() => {
    // When windows change, sync the stores
    syncStores()
  })

  // Return the unsubscribe function
  return unsubscribe
}
