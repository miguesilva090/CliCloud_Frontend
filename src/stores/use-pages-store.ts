import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useWindowsStore } from './use-windows-store'

export type PageState = {
  // Table related state
  filters: Array<{ id: string; value: string }>
  sorting: Array<{ id: string; desc: boolean }>
  pagination: {
    page: number
    pageSize: number
  }
  columnVisibility: Record<string, boolean>

  // Form related state - removed to avoid duplication with forms store
  // formData?: Record<string, any>

  // Navigation state
  pathname?: string

  // Additional page state
  selectedRows?: string[]
  modalStates?: Record<string, boolean>
  searchParams?: Record<string, string>

  // Window instance support
  windowId: string

  // Memory optimization fields
  lastActive: number
  dataSize: number
}

interface PagesState {
  pages: Record<string, PageState>
  setPageState: (windowId: string, newState: Partial<PageState>) => void
  resetPageState: (windowId: string) => void
  removePageState: (windowId: string) => void
  getPageState: (windowId: string) => PageState
  updatePageState: (
    windowId: string,
    updater: (state: PageState) => Partial<PageState>
  ) => void
  // Methods for window instance support
  getPageStateByWindowId: (windowId: string) => PageState | null
  setPageStateByWindowId: (
    windowId: string,
    newState: Partial<PageState>
  ) => void
  removePageStateByWindowId: (windowId: string) => void
  // New method to clean up orphaned page states
  cleanupOrphanedPageStates: () => void
  // New method to get memory usage
  getMemoryUsage: () => { totalPages: number; totalSize: number }
  // New method to cleanup old pages
  cleanupOldPages: (maxAge: number) => void
}

const defaultPageState: PageState = {
  filters: [],
  sorting: [],
  pagination: {
    page: 1,
    pageSize: 10,
  },
  columnVisibility: {},
  selectedRows: [],
  modalStates: {},
  searchParams: {},
  windowId: '',
  lastActive: Date.now(),
  dataSize: 0,
}

// Helper function to calculate data size
const calculateDataSize = (data: any): number => {
  try {
    return new Blob([JSON.stringify(data)]).size
  } catch {
    return 0
  }
}

// Helper function to check if data has actually changed
const hasDataChanged = (oldData: any, newData: any): boolean => {
  if (oldData === newData) return false
  if (!oldData && !newData) return false
  if (!oldData || !newData) return true

  try {
    return JSON.stringify(oldData) !== JSON.stringify(newData)
  } catch {
    return true
  }
}

// Create a selector factory for memoized state access
const createPageStateSelector = (windowId: string) => (state: PagesState) =>
  state.pages[windowId] || defaultPageState

export const usePagesStore = create<PagesState>()(
  persist(
    (set, get) => ({
      pages: {},

      setPageState: (windowId, newState) => {
        set((state) => {
          const currentState = state.pages[windowId] || defaultPageState

          // Only update changed fields to reduce unnecessary re-renders
          const updatedState = Object.entries(newState).reduce(
            (acc, [key, value]) => {
              const currentValue = currentState[key as keyof PageState]

              // Use optimized change detection
              if (hasDataChanged(currentValue, value)) {
                // Type-safe assignment based on the key
                switch (key) {
                  case 'filters':
                    acc.filters = value as Array<{ id: string; value: string }>
                    break
                  case 'sorting':
                    acc.sorting = value as Array<{ id: string; desc: boolean }>
                    break
                  case 'pagination':
                    acc.pagination = value as { page: number; pageSize: number }
                    break
                  case 'columnVisibility':
                    acc.columnVisibility = value as Record<string, boolean>
                    break
                  case 'pathname':
                    acc.pathname = value as string
                    break
                  case 'selectedRows':
                    acc.selectedRows = value as string[]
                    break
                  case 'modalStates':
                    acc.modalStates = value as Record<string, boolean>
                    break
                  case 'searchParams':
                    acc.searchParams = value as Record<string, string>
                    break
                  case 'windowId':
                    acc.windowId = value as string
                    break
                  case 'lastActive':
                    acc.lastActive = value as number
                    break
                  case 'dataSize':
                    acc.dataSize = value as number
                    break
                  default:
                    // Skip unknown keys
                    break
                }
              }
              return acc
            },
            {} as Partial<PageState>
          )

          if (Object.keys(updatedState).length === 0) return state

          // Calculate total data size for the updated state
          const totalDataSize = calculateDataSize({
            ...currentState,
            ...updatedState,
          })

          return {
            pages: {
              ...state.pages,
              [windowId]: {
                ...currentState,
                ...updatedState,
                windowId, // Always ensure windowId is set
                lastActive: Date.now(), // Update last active timestamp
                dataSize: totalDataSize,
              },
            },
          }
        })
      },

      resetPageState: (windowId) => {
        set((state) => ({
          pages: {
            ...state.pages,
            [windowId]: {
              ...defaultPageState,
              windowId, // Always ensure windowId is set
              lastActive: Date.now(),
            },
          },
        }))
      },

      removePageState: (windowId) => {
        set((state) => {
          const { [windowId]: removed, ...remainingPages } = state.pages
          return {
            pages: remainingPages,
          }
        })
      },

      getPageState: (windowId) => {
        return get().pages[windowId] || defaultPageState
      },

      updatePageState: (windowId, updater) => {
        set((state) => {
          const currentState = state.pages[windowId] || defaultPageState
          const updates = updater(currentState)

          // Only update if there are actual changes
          const hasChanges = Object.entries(updates).some(([key, value]) =>
            hasDataChanged(currentState[key as keyof PageState], value)
          )

          if (!hasChanges) return state

          // Calculate total data size for the updated state
          const totalDataSize = calculateDataSize({
            ...currentState,
            ...updates,
          })

          return {
            pages: {
              ...state.pages,
              [windowId]: {
                ...currentState,
                ...updates,
                lastActive: Date.now(),
                dataSize: totalDataSize,
              },
            },
          }
        })
      },

      // Methods for window instance support
      getPageStateByWindowId: (windowId) => {
        const state = get()
        return state.pages[windowId] || null
      },

      setPageStateByWindowId: (windowId, newState) => {
        set((state) => {
          const currentState = state.pages[windowId] || defaultPageState

          // Only update changed fields
          const updatedState = Object.entries(newState).reduce(
            (acc, [key, value]) => {
              const currentValue = currentState[key as keyof PageState]

              // Use optimized change detection
              if (hasDataChanged(currentValue, value)) {
                // Type-safe assignment based on the key
                switch (key) {
                  case 'filters':
                    acc.filters = value as Array<{ id: string; value: string }>
                    break
                  case 'sorting':
                    acc.sorting = value as Array<{ id: string; desc: boolean }>
                    break
                  case 'pagination':
                    acc.pagination = value as { page: number; pageSize: number }
                    break
                  case 'columnVisibility':
                    acc.columnVisibility = value as Record<string, boolean>
                    break
                  case 'pathname':
                    acc.pathname = value as string
                    break
                  case 'selectedRows':
                    acc.selectedRows = value as string[]
                    break
                  case 'modalStates':
                    acc.modalStates = value as Record<string, boolean>
                    break
                  case 'searchParams':
                    acc.searchParams = value as Record<string, string>
                    break
                  case 'windowId':
                    acc.windowId = value as string
                    break
                  case 'lastActive':
                    acc.lastActive = value as number
                    break
                  case 'dataSize':
                    acc.dataSize = value as number
                    break
                  default:
                    // Skip unknown keys
                    break
                }
              }
              return acc
            },
            {} as Partial<PageState>
          )

          if (Object.keys(updatedState).length === 0) return state

          // Calculate total data size for the updated state
          const totalDataSize = calculateDataSize({
            ...currentState,
            ...updatedState,
          })

          return {
            pages: {
              ...state.pages,
              [windowId]: {
                ...currentState,
                ...updatedState,
                windowId, // Always ensure windowId is set
                lastActive: Date.now(),
                dataSize: totalDataSize,
              },
            },
          }
        })
      },

      removePageStateByWindowId: (windowId) => {
        set((state) => {
          const { [windowId]: removed, ...remainingPages } = state.pages
          return {
            pages: remainingPages,
          }
        })
      },

      // New method to clean up orphaned page states
      cleanupOrphanedPageStates: () => {
        set((state) => {
          const windowsStore = useWindowsStore.getState()
          const activeWindowIds = windowsStore.windows.map((w) => w.id)

          // Filter out pages that don't have an active window
          const validPages = Object.entries(state.pages).reduce(
            (acc, [windowId, pageState]) => {
              if (activeWindowIds.includes(windowId)) {
                acc[windowId] = pageState
              }
              return acc
            },
            {} as Record<string, PageState>
          )

          return {
            pages: validPages,
          }
        })
      },

      getMemoryUsage: () => {
        const state = get()
        const pages = Object.values(state.pages)
        const totalPages = pages.length
        const totalSize = pages.reduce((sum, page) => sum + page.dataSize, 0)

        return { totalPages, totalSize }
      },

      cleanupOldPages: (maxAge) => {
        set((state) => {
          const now = Date.now()
          const cleanedPages = Object.entries(state.pages).reduce(
            (acc, [windowId, page]) => {
              // Keep pages that are recent or have active data
              if (
                now - page.lastActive < maxAge ||
                page.filters.length > 0 ||
                (page.selectedRows && page.selectedRows.length > 0)
              ) {
                acc[windowId] = page
              }
              return acc
            },
            {} as Record<string, PageState>
          )

          return { pages: cleanedPages }
        })
      },
    }),
    {
      name: 'pages-storage',
      // Only persist specific fields and only for active windows
      partialize: (state) => {
        // Get active windows from the windows store
        const windowsStore = useWindowsStore.getState()
        const activeWindowIds = windowsStore.windows.map((w) => w.id)

        return {
          pages: Object.entries(state.pages).reduce(
            (acc, [windowId, value]) => {
              // Only persist pages that have an active window
              if (activeWindowIds.includes(windowId)) {
                acc[windowId] = {
                  filters: value.filters,
                  sorting: value.sorting,
                  pagination: value.pagination,
                  columnVisibility: value.columnVisibility,
                  selectedRows: value.selectedRows,
                  windowId: value.windowId,
                  lastActive: value.lastActive,
                  dataSize: value.dataSize,
                }
              }
              return acc
            },
            {} as Record<string, Partial<PageState>>
          ),
        }
      },
    }
  )
)

// Custom hook for easier page state management with optimized re-renders
export const usePageState = (windowId: string) => {
  const store = usePagesStore()
  const pageState = usePagesStore(createPageStateSelector(windowId))
  const { setPageState, resetPageState, updatePageState } = store

  // Memoize handlers to prevent unnecessary re-renders
  const handlers = {
    setFilters: (filters: Array<{ id: string; value: string }>) =>
      setPageState(windowId, { filters }),
    setSorting: (sorting: Array<{ id: string; desc: boolean }>) =>
      setPageState(windowId, { sorting }),
    setPagination: (page: number, pageSize: number) =>
      setPageState(windowId, { pagination: { page, pageSize } }),
    setColumnVisibility: (columnVisibility: Record<string, boolean>) =>
      setPageState(windowId, { columnVisibility }),
    setPathname: (pathname: string) => setPageState(windowId, { pathname }),
    setSelectedRows: (selectedRows: string[]) =>
      setPageState(windowId, { selectedRows }),
    setModalState: (modalId: string, isOpen: boolean) =>
      updatePageState(windowId, (state) => ({
        modalStates: {
          ...state.modalStates,
          [modalId]: isOpen,
        },
      })),
    setSearchParams: (searchParams: Record<string, string>) =>
      setPageState(windowId, { searchParams }),
    resetState: () => resetPageState(windowId),
  }

  return {
    ...pageState,
    ...handlers,
  }
}

// Custom hook for window instance-based page state management
export const useWindowPageState = (windowId: string) => {
  const store = usePagesStore()
  const {
    getPageStateByWindowId,
    setPageStateByWindowId,
    removePageStateByWindowId,
  } = store

  // Get the current page state or initialize with default state
  const pageState = getPageStateByWindowId(windowId) || {
    ...defaultPageState,
    windowId,
    // Ensure new windows start with empty filters, sorting, etc.
    filters: [],
    sorting: [],
    pagination: {
      page: 1,
      pageSize: 10,
    },
    columnVisibility: {},
    selectedRows: [],
    modalStates: {},
    searchParams: {},
  }

  // Memoize handlers to prevent unnecessary re-renders
  const handlers = {
    setFilters: (filters: Array<{ id: string; value: string }>) =>
      setPageStateByWindowId(windowId, { filters }),
    setSorting: (sorting: Array<{ id: string; desc: boolean }>) =>
      setPageStateByWindowId(windowId, { sorting }),
    setPagination: (page: number, pageSize: number) =>
      setPageStateByWindowId(windowId, { pagination: { page, pageSize } }),
    setColumnVisibility: (columnVisibility: Record<string, boolean>) =>
      setPageStateByWindowId(windowId, { columnVisibility }),
    setPathname: (pathname: string) =>
      setPageStateByWindowId(windowId, { pathname }),
    setSelectedRows: (selectedRows: string[]) =>
      setPageStateByWindowId(windowId, { selectedRows }),
    setModalState: (modalId: string, isOpen: boolean) =>
      setPageStateByWindowId(windowId, {
        modalStates: {
          ...pageState.modalStates,
          [modalId]: isOpen,
        },
      }),
    setSearchParams: (searchParams: Record<string, string>) =>
      setPageStateByWindowId(windowId, { searchParams }),
    resetState: () => setPageStateByWindowId(windowId, defaultPageState),
    removeState: () => removePageStateByWindowId(windowId),
  }

  return {
    ...pageState,
    ...handlers,
  }
}
