import { useFormsStore } from '@/stores/use-forms-store'
import { useMapStore } from '@/stores/use-map-store'
import { useNavigationHistoryStore } from '@/stores/use-navigation-history-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useWindowsStore } from '@/stores/use-windows-store'

interface MemoryConfig {
  maxFormStates: number
  maxPageStates: number
  maxWindowCache: number
  maxMapStates: number
  cleanupInterval: number // in milliseconds
  formDataExpiry: number // in milliseconds
  pageDataExpiry: number // in milliseconds
}

const DEFAULT_CONFIG: MemoryConfig = {
  maxFormStates: 50,
  maxPageStates: 30,
  maxWindowCache: 20,
  maxMapStates: 10,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  formDataExpiry: 60 * 60 * 1000, // 1 hour
  pageDataExpiry: 2 * 60 * 60 * 1000, // 2 hours
}

class MemoryManager {
  private config: MemoryConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startPeriodicCleanup()
  }

  /**
   * Start periodic cleanup of memory
   */
  private startPeriodicCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.performCleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Perform comprehensive memory cleanup
   */
  public performCleanup(): void {
    console.log('[MemoryManager] A iniciar limpeza...')

    this.cleanupFormStates()
    this.cleanupPageStates()
    this.cleanupWindowCache()
    this.cleanupMapStates()
    this.cleanupLocalStorage()

    console.log('[MemoryManager] Limpeza concluída')
  }

  /**
   * Clean up form states based on usage and age
   */
  private cleanupFormStates(): void {
    const formsStore = useFormsStore.getState()
    const forms = formsStore.forms
    const now = Date.now()

    // Get forms sorted by last activity
    const sortedForms = Object.entries(forms)
      .map(([id, form]) => ({ id, ...form }))
      .sort((a, b) => b.lastActive - a.lastActive)

    // Keep only the most recent and active forms
    const formsToKeep = sortedForms.slice(0, this.config.maxFormStates)
    const formsToRemove = sortedForms.slice(this.config.maxFormStates)

    // Remove expired forms
    const expiredForms = formsToKeep.filter(
      (form) => now - form.lastActive > this.config.formDataExpiry
    )

    // Remove forms that haven't been modified
    const inactiveForms = formsToKeep.filter(
      (form) => !form.hasBeenModified && !form.isDirty
    )

    const allFormsToRemove = [
      ...formsToRemove,
      ...expiredForms,
      ...inactiveForms,
    ]

    allFormsToRemove.forEach((form) => {
      formsStore.removeFormState(form.id)
    })

    if (allFormsToRemove.length > 0) {
      console.log(
        `[MemoryManager] Removidos ${allFormsToRemove.length} estados de formulários`
      )
    }
  }

  /**
   * Clean up page states based on window activity
   */
  private cleanupPageStates(): void {
    const pagesStore = usePagesStore.getState()
    const windowsStore = useWindowsStore.getState()
    const pages = pagesStore.pages

    // Get active window IDs
    const activeWindowIds = windowsStore.windows.map((w) => w.id)

    // Remove pages for inactive windows
    const pagesToRemove = Object.keys(pages).filter(
      (windowId) => !activeWindowIds.includes(windowId)
    )

    pagesToRemove.forEach((windowId) => {
      pagesStore.removePageStateByWindowId(windowId)
    })

    // Clean up orphaned page states
    pagesStore.cleanupOrphanedPageStates()

    if (pagesToRemove.length > 0) {
      console.log(
        `[MemoryManager] Removidos ${pagesToRemove.length} estados de páginas`
      )
    }
  }

  /**
   * Clean up window cache
   */
  private cleanupWindowCache(): void {
    const windowsStore = useWindowsStore.getState()
    const cache = windowsStore.windowCache

    if (cache.size > this.config.maxWindowCache) {
      // Remove least recently used items
      const entries = Array.from(cache.entries())
      const sortedEntries = entries.sort((a, b) => {
        const windowA = windowsStore.windows.find((w) => w.id === a[0])
        const windowB = windowsStore.windows.find((w) => w.id === b[0])
        return (windowA?.lastAccessed || 0) - (windowB?.lastAccessed || 0)
      })

      const toRemove = sortedEntries.slice(
        0,
        cache.size - this.config.maxWindowCache
      )
      toRemove.forEach(([key]) => cache.delete(key))

      console.log(
        `[MemoryManager] Removidas ${toRemove.length} entradas de cache de janelas`
      )
    }
  }

  /**
   * Clean up map states
   */
  private cleanupMapStates(): void {
    const mapStore = useMapStore.getState()
    const maps = mapStore.maps
    const windowsStore = useWindowsStore.getState()
    const activeWindowIds = windowsStore.windows.map((w) => w.id)

    // Remove map states for inactive windows
    const mapsToRemove = Object.keys(maps).filter((key) => {
      const windowId = key.split('-')[0]
      return !activeWindowIds.includes(windowId)
    })

    mapsToRemove.forEach((key) => {
      const [windowId] = key.split('-')
      mapStore.cleanupWindowData(windowId)
    })

    if (mapsToRemove.length > 0) {
      console.log(
        `[MemoryManager] Removidos ${mapsToRemove.length} estados de mapas`
      )
    }
  }

  /**
   * Clean up localStorage
   */
  private cleanupLocalStorage(): void {
    const now = Date.now()

    // Clean up old session data
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('session') || key.includes('temp')) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const data = JSON.parse(item)
            if (
              data.timestamp &&
              now - data.timestamp > this.config.pageDataExpiry
            ) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key)
        }
      }
    })
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStats(): {
    formStates: number
    pageStates: number
    windowCache: number
    mapStates: number
    localStorageSize: number
  } {
    const formsStore = useFormsStore.getState()
    const pagesStore = usePagesStore.getState()
    const windowsStore = useWindowsStore.getState()
    const mapStore = useMapStore.getState()

    let localStorageSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        localStorageSize += (key.length + (value?.length || 0)) * 2 // UTF-16 characters
      }
    }

    return {
      formStates: Object.keys(formsStore.forms).length,
      pageStates: Object.keys(pagesStore.pages).length,
      windowCache: windowsStore.windowCache.size,
      mapStates: Object.keys(mapStore.maps).length,
      localStorageSize: Math.round(localStorageSize / 1024), // KB
    }
  }

  /**
   * Force cleanup of all data
   */
  public forceCleanup(navigate?: (path: string) => void): void {
    // Clear all stores
    const formsStore = useFormsStore.getState()
    const pagesStore = usePagesStore.getState()
    const windowsStore = useWindowsStore.getState()
    const mapStore = useMapStore.getState()
    const navigationStore = useNavigationHistoryStore.getState()

    formsStore.clearAllFormData()
    pagesStore.pages = {}
    windowsStore.clearAllWindows()
    mapStore.maps = {}
    navigationStore.clearHistory()

    // Clear localStorage (preservar chaves importantes)
    const PRESERVED_LOCALSTORAGE_KEYS = ['vite-ui-theme', 'theme']

    Object.keys(localStorage).forEach((key) => {
      const shouldPreserve = PRESERVED_LOCALSTORAGE_KEYS.some((preserved) =>
        key.includes(preserved)
      )

      if (
        !shouldPreserve &&
        (key.includes('storage') || key.includes('cache'))
      ) {
        localStorage.removeItem(key)
      }
    })

    // Force Zustand to persist the cleared state
    useFormsStore.persist.clearStorage()
    usePagesStore.persist.clearStorage()
    useWindowsStore.persist.clearStorage()
    useMapStore.persist.clearStorage()
    useNavigationHistoryStore.persist.clearStorage()

    // Navigate to home page if navigate function is provided
    if (navigate) {
      navigate('/')

      // Add delayed cleanup to catch any forms created during navigation
      setTimeout(() => {
        const delayedFormsStore = useFormsStore.getState()
        const delayedPagesStore = usePagesStore.getState()
        const delayedWindowsStore = useWindowsStore.getState()
        const delayedMapStore = useMapStore.getState()

        // Clear any forms that were created during navigation
        if (Object.keys(delayedFormsStore.forms).length > 0) {
          delayedFormsStore.clearAllFormData()
          useFormsStore.persist.clearStorage()
        }

        // Clear any other data that might have been recreated
        if (Object.keys(delayedPagesStore.pages).length > 0) {
          delayedPagesStore.pages = {}
          usePagesStore.persist.clearStorage()
        }

        if (delayedWindowsStore.windows.length > 0) {
          delayedWindowsStore.clearAllWindows()
          useWindowsStore.persist.clearStorage()
        }

        if (Object.keys(delayedMapStore.maps).length > 0) {
          delayedMapStore.maps = {}
          useMapStore.persist.clearStorage()
        }

        // Trigger a custom event to notify components that cleanup is complete
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('memoryCleanupComplete'))
        }
      }, 500) // Wait 500ms for navigation to complete
    }
  }

  /**
   * Stop the memory manager
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.startPeriodicCleanup()
  }
}

// Create singleton instance
export const memoryManager = new MemoryManager()

// Export for use in components
export const useMemoryManager = () => {
  return {
    performCleanup: () => memoryManager.performCleanup(),
    getMemoryStats: () => memoryManager.getMemoryStats(),
    forceCleanup: (navigate?: (path: string) => void) =>
      memoryManager.forceCleanup(navigate),
    updateConfig: (config: Partial<MemoryConfig>) =>
      memoryManager.updateConfig(config),
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.performCleanup()
  })
}
