import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { usePagesStore } from './use-pages-store'

export interface WindowState {
  id: string
  instanceId: string // Unique identifier for each instance of a route
  title: string
  isMinimized: boolean
  path: string
  hasFormData?: boolean
  searchParams?: Record<string, string>
  cachedContent?: any // Cache for window content
  lastAccessed?: number // Timestamp for LRU cache
  activeTab?: string // Active tab state for pages with tabs
  // New fields for window communication
  parentWindowId?: string // ID of the parent window that opened this window
  returnData?: any // Data to be returned to the parent window when this window closes
}

interface WindowStore {
  windows: WindowState[]
  activeWindow: string | null
  windowCache: Map<string, any> // LRU cache for window content
  maxCacheSize: number
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void
  removeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  setActiveWindow: (id: string) => void
  updateWindowState: (id: string, updates: Partial<WindowState>) => void
  setWindowHasFormData: (id: string, hasFormData: boolean) => void
  getCachedContent: (id: string) => any
  setCachedContent: (id: string, content: any) => void
  findWindowByPathAndInstanceId: (
    path: string,
    instanceId: string
  ) => WindowState | undefined
  getWindowsByPath: (path: string) => WindowState[]
  // New methods for window communication
  setWindowReturnData: (id: string, data: any) => void
  getWindowReturnData: (id: string) => any
  clearWindowReturnData: (id: string) => void
  findChildWindows: (parentWindowId: string) => WindowState[]
  // Memory cleanup methods
  clearAllWindows: () => void
}

export const useWindowsStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindow: null,
      windowCache: new Map(),
      maxCacheSize: 10, // Maximum number of windows to cache

      // Igual ao Luma: cada instância (path + instanceId) é uma janela distinta;
      // não deduplicar só por path (evita URL/instanceId desalinhados com a tab ativa).
      addWindow: (window) =>
        set((state) => {
          const updatedWindows = state.windows.map((w) => ({
            ...w,
            isMinimized: true,
          }))

          const newWindow = {
            ...window,
            isMinimized: false,
            lastAccessed: Date.now(),
          }

          return {
            windows: [...updatedWindows, newWindow],
            activeWindow: window.id,
          }
        }),

      removeWindow: (id) =>
        set((state) => {
          // Remove window from cache
          const newCache = new Map(state.windowCache)
          newCache.delete(id)

          // Clean up the page state for this window
          const pagesStore = usePagesStore.getState()
          pagesStore.removePageStateByWindowId(id)

          return {
            windows: state.windows.filter((w) => w.id !== id),
            activeWindow: state.activeWindow === id ? null : state.activeWindow,
            windowCache: newCache,
          }
        }),

      minimizeWindow: (id) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, isMinimized: true } : w
          ),
          activeWindow: state.activeWindow === id ? null : state.activeWindow,
        })),

      restoreWindow: (id) =>
        set((state) => {
          const now = Date.now()
          return {
            windows: state.windows.map((w) =>
              w.id === id
                ? { ...w, isMinimized: false, lastAccessed: now }
                : { ...w, isMinimized: true }
            ),
            activeWindow: id,
          }
        }),

      setActiveWindow: (id) =>
        set((state) => {
          const now = Date.now()
          return {
            activeWindow: id,
            windows: state.windows.map((w) =>
              w.id === id ? { ...w, lastAccessed: now } : w
            ),
          }
        }),

      updateWindowState: (id, updates) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  ...updates,
                  lastAccessed: Date.now(),
                }
              : w
          ),
        })),

      setWindowHasFormData: (id, hasFormData) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, hasFormData } : w
          ),
        })),

      getCachedContent: (id) => {
        const state = get()
        return state.windowCache.get(id)
      },

      setCachedContent: (id, content) =>
        set((state) => {
          const newCache = new Map(state.windowCache)

          // If cache is full, remove the least recently accessed window
          if (newCache.size >= state.maxCacheSize) {
            const windows = state.windows
            const oldestWindow = windows.reduce((oldest, current) =>
              (oldest.lastAccessed || 0) < (current.lastAccessed || 0)
                ? oldest
                : current
            )
            newCache.delete(oldestWindow.id)
          }

          newCache.set(id, content)
          return { windowCache: newCache }
        }),

      findWindowByPathAndInstanceId: (path, instanceId) => {
        const state = get()
        return state.windows.find(
          (w) => w.path === path && w.instanceId === instanceId
        )
      },

      getWindowsByPath: (path) => {
        const state = get()
        return state.windows.filter((w) => w.path === path)
      },

      // New methods for window communication
      setWindowReturnData: (id, data) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, returnData: data } : w
          ),
        })),

      getWindowReturnData: (id) => {
        const state = get()
        const window = state.windows.find((w) => w.id === id)
        return window?.returnData
      },

      clearWindowReturnData: (id) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, returnData: undefined } : w
          ),
        })),

      findChildWindows: (parentWindowId) => {
        const state = get()
        return state.windows.filter((w) => w.parentWindowId === parentWindowId)
      },

      // Memory cleanup methods
      clearAllWindows: () =>
        set((state) => {
          // Clear all page states for all windows
          const pagesStore = usePagesStore.getState()
          state.windows.forEach((window) => {
            pagesStore.removePageStateByWindowId(window.id)
          })

          // Clear all windows and cache
          return {
            windows: [],
            activeWindow: null,
            windowCache: new Map(),
          }
        }),
    }),
    {
      name: 'windows-storage',
      partialize: (state) => ({
        windows: state.windows.map(({ cachedContent, ...window }) => window), // Don't persist cache
      }),
    }
  )
)
