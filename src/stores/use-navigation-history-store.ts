import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shouldManageWindow, generateInstanceId } from '@/utils/window-utils'

export interface VisitedPage {
  id: string
  path: string
  title: string
  module: string
  timestamp: number
  searchParams?: Record<string, string>
  instanceId?: string
}

interface NavigationHistoryState {
  visitedPages: VisitedPage[]
  maxHistorySize: number

  // Actions
  addVisitedPage: (page: Omit<VisitedPage, 'id' | 'timestamp'>) => void
  getLastVisitedPage: () => VisitedPage | null
  getRecentPages: (limit?: number) => VisitedPage[]
  clearHistory: () => void
  removePage: (pageId: string) => void
  updatePageTitle: (path: string, title: string) => void
}

const defaultState = {
  visitedPages: [],
  maxHistorySize: 50,
}

export const useNavigationHistoryStore = create<NavigationHistoryState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addVisitedPage: (pageData) => {
        const { visitedPages, maxHistorySize } = get()
        const now = Date.now()

        // Only track pages that should manage windows
        if (!shouldManageWindow(pageData.path)) {
          return
        }

        // Create new page entry
        const newPage: VisitedPage = {
          id: generateInstanceId(),
          timestamp: now,
          ...pageData,
        }

        // Remove any existing entry for the same path to avoid duplicates
        const filteredPages = visitedPages.filter(
          (page) => page.path !== pageData.path
        )

        // Add new page to the beginning of the array
        const updatedPages = [newPage, ...filteredPages]

        // Limit the history size
        const limitedPages = updatedPages.slice(0, maxHistorySize)

        set({ visitedPages: limitedPages })
      },

      getLastVisitedPage: () => {
        const { visitedPages } = get()
        return visitedPages.length > 0 ? visitedPages[0] : null
      },

      getRecentPages: (limit = 10) => {
        const { visitedPages } = get()
        return visitedPages.slice(0, limit)
      },

      clearHistory: () => {
        set({ visitedPages: [] })
      },

      removePage: (pageId) => {
        const { visitedPages } = get()
        const updatedPages = visitedPages.filter((page) => page.id !== pageId)
        set({ visitedPages: updatedPages })
      },

      updatePageTitle: (path, title) => {
        const { visitedPages } = get()
        const updatedPages = visitedPages.map((page) =>
          page.path === path ? { ...page, title } : page
        )
        set({ visitedPages: updatedPages })
      },
    }),
    {
      name: 'navigation-history-storage',
      version: 1,
    }
  )
)

// Helper function to get page title from path
export const getPageTitleFromPath = (path: string): string => {
  // Remove query parameters and instanceId
  const cleanPath = path.split('?')[0]

  // Map common paths to user-friendly titles (apenas rotas ativas: utilitarios, reports)
  const pathTitleMap: Record<string, string> = {
    // Utilitários - Tabelas Geográficas
    '/utilitarios/tabelas/geograficas/paises': 'Países',
    '/utilitarios/tabelas/geograficas/paises/create': 'Criar País',
    '/utilitarios/tabelas/geograficas/paises/update': 'Editar País',
    '/utilitarios/tabelas/geograficas/distritos': 'Distritos',
    '/utilitarios/tabelas/geograficas/distritos/create': 'Criar Distrito',
    '/utilitarios/tabelas/geograficas/distritos/update': 'Editar Distrito',
    '/utilitarios/tabelas/geograficas/concelhos': 'Concelhos',
    '/utilitarios/tabelas/geograficas/concelhos/create': 'Criar Concelho',
    '/utilitarios/tabelas/geograficas/concelhos/update': 'Editar Concelho',
    '/utilitarios/tabelas/geograficas/freguesias': 'Freguesias',
    '/utilitarios/tabelas/geograficas/freguesias/create': 'Criar Freguesia',
    '/utilitarios/tabelas/geograficas/freguesias/update': 'Editar Freguesia',
    '/utilitarios/tabelas/geograficas/ruas': 'Ruas',
    '/utilitarios/tabelas/geograficas/ruas/create': 'Criar Rua',
    '/utilitarios/tabelas/geograficas/ruas/update': 'Editar Rua',
    '/utilitarios/tabelas/geograficas/codigospostais': 'Códigos Postais',
    '/utilitarios/tabelas/geograficas/codigospostais/create':
      'Criar Código Postal',
    '/utilitarios/tabelas/geograficas/codigospostais/update':
      'Editar Código Postal',

    // Relatórios
    '/reports': 'Lista de Relatórios',
  }

  // Check for exact match first
  if (pathTitleMap[cleanPath]) {
    return pathTitleMap[cleanPath]
  }

  // Check for partial matches (for nested routes)
  for (const [route, title] of Object.entries(pathTitleMap)) {
    if (cleanPath.startsWith(route + '/')) {
      return title
    }
  }

  // Fallback: format the path nicely
  const segments = cleanPath.split('/').filter(Boolean)
  if (segments.length === 0) return 'Dashboard'

  return segments
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' > ')
}

// Helper function to get module from path (apenas módulos ativos)
export const getModuleFromPath = (path: string): string => {
  if (path.startsWith('/utilitarios')) return 'Utilitários'
  if (path.startsWith('/reports')) return 'Relatórios'
  return 'Sistema'
}
