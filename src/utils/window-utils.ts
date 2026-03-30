import { useCallback } from 'react'
import { roleHeaderMenus } from '@/config/menu-items'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useMapStore } from '@/stores/use-map-store'
import { useWindowsStore, WindowState } from '@/stores/use-windows-store'
import { Icons } from '@/components/ui/icons'

// Wrapper de window.open para evitar erros de export em módulos ESM
// e permitir imports `{ open } from '@/utils/window-utils'` se existirem.
export function open(
  url?: string | URL,
  target?: string,
  features?: string,
): Window | null {
  if (typeof window === 'undefined' || typeof window.open !== 'function') {
    return null
  }
  return window.open(url?.toString(), target, features)
}

/**
 * Hook to get the current window ID based on the location and instance ID.
 * This is useful for components that need to access the current window's page state.
 */
export function useCurrentWindowId() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId')
  const { windows } = useWindowsStore()

  // First try to find a window with the exact path and instanceId
  const currentWindow = instanceId
    ? windows.find(
        (w) => w.path === location.pathname && w.instanceId === instanceId
      )
    : null

  // IMPORTANT: Only use fallback if there's NO instanceId in the URL
  // If instanceId is present, we must wait for the exact window to be created
  // This prevents forms from updating the wrong window during initialization
  const fallbackWindow = !instanceId
    ? windows.find((w) => w.path === location.pathname)
    : null

  const resolvedWindow = currentWindow || fallbackWindow
  const windowId = resolvedWindow?.id || ''

  return windowId
}

/**
 * Function to get the current window ID based on the location and instance ID.
 * This is useful for non-component code that needs to access the current window's page state.
 */
export function getCurrentWindowId() {
  const location = window.location
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId')
  const windows = useWindowsStore.getState().windows

  // Find a window with the exact path and instanceId match
  const currentWindow = instanceId
    ? windows.find(
        (w) => w.path === location.pathname && w.instanceId === instanceId
      )
    : null

  // IMPORTANT: Only use fallback if there's NO instanceId in the URL
  // If instanceId is present, we must wait for the exact window to be created
  // This prevents forms from updating the wrong window during initialization
  const fallbackWindow = !instanceId
    ? windows.find((w) => w.path === location.pathname)
    : null

  const resolvedWindow = currentWindow || fallbackWindow
  return resolvedWindow?.id || ''
}

// Helpers para navegação especial (usadas no header/dashboard)
export function isTabelasPath(href: string): boolean {
  return typeof href === 'string' && href.startsWith('/area-comum/tabelas/')
}

export function isProcessoClinicoPath(href: string): boolean {
  if (typeof href !== 'string') return false
  return (
    href === '/area-clinica/processo-clinico' ||
    href.startsWith('/area-clinica/processo-clinico/')
  )
}

/**
 * Indica se uma rota deve ser gerida pelo sistema de janelas/tabs.
 * Usado em stores de navegação (ex.: use-navigation-history-store)
 * para distinguir entre ecrãs "principais" e páginas simples.
 */
export function shouldManageWindow(pathname: string): boolean {
  if (typeof pathname !== 'string') return false
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`

  // Área Comum – Tabelas
  if (path.startsWith('/area-comum/tabelas')) return true

  // Área Clínica – Processo Clínico
  if (path.startsWith('/area-clinica/processo-clinico')) return true

  // Utentes raiz e suas secções principais
  if (path === '/utentes' || path.startsWith('/utentes/')) return true

  // Outras áreas principais onde faz sentido ter janelas
  if (path.startsWith('/reports')) return true
  if (path.startsWith('/utilitarios')) return true

  return false
}

/**
 * Gets the form ID for a specific form type and window instance.
 * This is used to uniquely identify form state across different window instances.
 */
export function getFormId(
  formType: string,
  entityType: string,
  instanceId: string
): string {
  return `${entityType}-${formType}-${instanceId}`
}

/**
 * Handles closing a window and cleaning up associated form state.
 * This is a common operation used in form components.
 */
export function handleWindowClose(
  windowId: string,
  navigate: (path: string) => void,
  removeWindow: (id: string) => void
) {
  const normalizePathForWindow = (p: string) => {
    const s = (p || '').split('?')[0].trim()
    if (!s) return ''
    const withSlash = s.startsWith('/') ? s : `/${s}`
    return withSlash.replace(/\/+$/, '') || '/'
  }

  const storeState = useWindowsStore.getState()
  const mapStore = useMapStore.getState()

  const getAreaRootPath = (path: string): string => {
    const p = (path || '').toLowerCase()
    if (p.startsWith('/area-clinica/processo-clinico'))
      return '/area-clinica/processo-clinico'
    if (p.startsWith('/area-comum/tabelas')) return '/area-comum/tabelas'
    if (p.startsWith('/utentes')) return '/utentes'
    if (p.startsWith('/reports')) return '/reports'
    if (p.startsWith('/utilitarios')) return '/utilitarios'
    return '/'
  }

  // 1) Identificar a janela a fechar (mesmo princípio do window-manager).
  let effectiveWindowId = windowId
  const instanceIdFromUrl =
    new URLSearchParams(window.location.search).get('instanceId') || null

  let closingWindow = storeState.windows.find((w) => w.id === effectiveWindowId)
  if (!closingWindow?.id && instanceIdFromUrl) {
    const here = normalizePathForWindow(window.location.pathname)
    closingWindow =
      storeState.windows.find(
        (w) =>
          w.instanceId === instanceIdFromUrl &&
          normalizePathForWindow(w.path) === here
      ) ?? storeState.windows.find((w) => w.instanceId === instanceIdFromUrl)
  }

  // Se não for possível identificar, não mexer (evita deixar tabs inconsistentes).
  if (!closingWindow?.id) return

  const windowPath = closingWindow.path

  // 2) removeWindow + limpezas (igual ao window-manager).
  removeWindow(closingWindow.id)

  const pagesStore = usePagesStore.getState()
  pagesStore.removePageStateByWindowId(closingWindow.id)
  mapStore.cleanupWindowData(closingWindow.id)
  cleanupWindowForms(closingWindow.id)

  // 3) restante windows.
  const remaining = useWindowsStore.getState().windows
  if (remaining.length === 0) {
    cleanupWindowForms('*')

    const targetPath = getAreaRootPath(windowPath)
    clearAllWindowData()
    window.location.href = `${window.location.origin}${targetPath}`
    return
  }

  // 4) Se estamos no path da janela que fechámos, ativar a última restante.
  if (
    normalizePathForWindow(windowPath) ===
    normalizePathForWindow(window.location.pathname)
  ) {
    const last = remaining[remaining.length - 1]
    const searchParams = new URLSearchParams()
    if (last.searchParams) {
      Object.entries(last.searchParams).forEach(([k, v]) =>
        searchParams.set(k, v)
      )
    }
    searchParams.set('instanceId', last.instanceId)
    useWindowsStore.getState().restoreWindow(last.id)
    navigate(`${last.path}?${searchParams.toString()}`)
  }
}

/**
 * Para páginas de listagem (botão X ao lado do refresh): mesmo fluxo que o "X" da barra inferior.
 * Usa `handleWindowClose` com o store — não usar `window.location.replace('/area-comum/tabelas')`.
 */
export function useCloseCurrentWindowLikeTabBar() {
  const navigate = useNavigate()
  const removeWindow = useWindowsStore((s) => s.removeWindow)
  return useCallback(() => {
    handleWindowClose('', navigate, removeWindow)
  }, [navigate, removeWindow])
}

/**
 * Updates window form data state when form values change.
 * This is used in form components to track if a form has unsaved changes.
 */
export function updateWindowFormData(
  windowId: string,
  hasChanges: boolean,
  setWindowHasFormData: (id: string, hasFormData: boolean) => void
) {
  setWindowHasFormData(windowId, hasChanges)
}

/**
 * Gets the current window instance ID from the URL.
 */
export function getCurrentInstanceId(): string {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('instanceId') || 'default'
}

/**
 * Gets the current window path and instance ID.
 */
export function getCurrentWindowInfo(): { path: string; instanceId: string } {
  const location = window.location
  const searchParams = new URLSearchParams(location.search)
  return {
    path: location.pathname,
    instanceId: searchParams.get('instanceId') || 'default',
  }
}

/**
 * Detects if form values have changed from their original values in update forms.
 * This provides a more accurate way to determine if an update form has unsaved changes.
 */
export function detectUpdateFormChanges(
  currentValues: Record<string, any>,
  originalValues: Record<string, any>
): boolean {
  const hasChanges = Object.entries(currentValues).some(([key, value]) => {
    const originalValue = originalValues[key]

    // Handle different data types
    let isChanged = false
    if (typeof value === 'boolean') {
      isChanged = value !== originalValue
    } else if (value instanceof Date && originalValue instanceof Date) {
      isChanged = value.getTime() !== originalValue.getTime()
    } else if (Array.isArray(value) && Array.isArray(originalValue)) {
      // For arrays, compare contents instead of references
      if (value.length !== originalValue.length) {
        isChanged = true
      } else {
        isChanged = value.some((item, index) => {
          const originalItem = originalValue[index]
          if (typeof item === 'object' && typeof originalItem === 'object') {
            return JSON.stringify(item) !== JSON.stringify(originalItem)
          }
          return item !== originalItem
        })
      }
    } else if (typeof value === 'string') {
      // Handle null/undefined vs empty string equivalence
      const normalizedCurrent = value || ''
      const normalizedOriginal = originalValue || ''
      isChanged = normalizedCurrent !== normalizedOriginal
    } else if (typeof value === 'number') {
      isChanged = value !== originalValue
    } else {
      // For other types, use strict equality
      isChanged = value !== originalValue
    }

    return isChanged
  })

  return hasChanges
}

/**
 * Detects if form values have changed from their default values.
 * This provides a more accurate way to determine if a form has unsaved changes.
 */
export function detectFormChanges(
  currentValues: Record<string, any>,
  defaultValues: Record<string, any>
): boolean {
  const hasChanges = Object.entries(currentValues).some(([key, value]) => {
    const defaultValue = defaultValues[key]

    // Handle different data types
    let isChanged = false
    if (typeof value === 'boolean') {
      isChanged = value !== defaultValue
    } else if (value instanceof Date && defaultValue instanceof Date) {
      isChanged = value.getTime() !== defaultValue.getTime()
    } else if (Array.isArray(value) && Array.isArray(defaultValue)) {
      // For arrays, compare contents instead of references
      if (value.length !== defaultValue.length) {
        isChanged = true
      } else {
        isChanged = value.some((item, index) => {
          const defaultItem = defaultValue[index]
          if (typeof item === 'object' && typeof defaultItem === 'object') {
            return JSON.stringify(item) !== JSON.stringify(defaultItem)
          }
          return item !== defaultItem
        })
      }
    } else if (typeof value === 'string') {
      isChanged = value !== (defaultValue || '')
    } else if (typeof value === 'number') {
      isChanged = value !== (defaultValue || 0)
    } else {
      // For other types, use strict equality
      isChanged = value !== defaultValue
    }

    return isChanged
  })

  return hasChanges
}

/**
 * Updates window form data state when form values change in create forms.
 * This is used in create form components to track if a form has unsaved changes.
 */
export function updateCreateFormData(
  windowId: string,
  formValues: Record<string, any>,
  setWindowHasFormData: (id: string, hasFormData: boolean) => void,
  defaultValues?: Record<string, any>
) {
  // If no default values provided, use a simple non-empty check
  if (!defaultValues) {
    const hasNonEmptyValues = Object.entries(formValues).some(([, value]) => {
      // For boolean fields, check if they differ from their default value (false)
      if (typeof value === 'boolean') {
        return value !== false // Consider true as having data
      }
      // For other fields, check if they have a non-empty value
      return value !== undefined && value !== '' && value !== null
    })
    setWindowHasFormData(windowId, hasNonEmptyValues)
    return
  }

  // Compare current values with default values to detect actual changes
  const hasChanges = detectFormChanges(formValues, defaultValues)

  setWindowHasFormData(windowId, hasChanges)
}

/**
 * Cleans up all forms associated with a window
 */
export function cleanupWindowForms(windowId: string) {
  const formsStore = useFormsStore.getState()

  if (windowId === '*') {
    // If '*' is passed, clear all form instances
    formsStore.clearAllFormData()
    return
  }

  const allFormIds = Object.keys(formsStore.forms)

  allFormIds.forEach((formId) => {
    const formState = formsStore.getFormState(formId)
    if (formState?.windowId === windowId) {
      formsStore.removeFormState(formId)
    }
  })
}

/**
 * Generates a unique instance ID for window management
 * Works on both HTTP and HTTPS contexts
 *
 * Note: Web Crypto API (crypto.randomUUID) only works in secure contexts (HTTPS/localhost)
 * For HTTP contexts, we use a fallback implementation
 */
export function generateInstanceId(): string {
  // Check if we're in a secure context (HTTPS or localhost)
  const isSecureContext =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1')

  // Only use crypto.randomUUID in secure contexts
  if (
    isSecureContext &&
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID()
    } catch (error) {
      // If crypto.randomUUID fails, fall back to manual generation
      console.warn('crypto.randomUUID failed, using fallback:', error)
    }
  }

  // Fallback for non-secure contexts (HTTP) or if crypto.randomUUID fails
  // Generates a UUID v4 compatible string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Truncates a title to a maximum of 10 characters with ellipsis
 */
export function truncateWindowTitle(title: string): string {
  return title.length > 10 ? `${title.substring(0, 10)}...` : title
}

/**
 * Gets the parent window information for a given window
 */
export function getParentWindowInfo(
  parentWindowId: string,
  windows: WindowState[]
): { title: string; path: string } | null {
  const parentWindow = windows.find((w) => w.id === parentWindowId)
  return parentWindow
    ? {
        title: parentWindow.title,
        path: parentWindow.path,
      }
    : null
}

/**
 * Gets all child windows for a given parent window
 */
export function getChildWindows(
  parentWindowId: string,
  windows: WindowState[]
): WindowState[] {
  return windows.filter((w) => w.parentWindowId === parentWindowId)
}

/**
 * Updates the window title for a create form based on the field value
 */
export function updateCreateWindowTitle(
  windowId: string,
  value: string | undefined,
  updateWindowState: (id: string, updates: Partial<WindowState>) => void
) {
  if (value) {
    const title = truncateWindowTitle(value)
    updateWindowState(windowId, { title })
  } else {
    updateWindowState(windowId, { title: 'Criar' })
  }
}

/**
 * Updates the window title for an update form based on the field value
 */
export function updateUpdateWindowTitle(
  windowId: string,
  value: string | undefined,
  updateWindowState: (id: string, updates: Partial<WindowState>) => void
) {
  if (value) {
    const title = truncateWindowTitle(value)
    updateWindowState(windowId, { title })
  } else {
    updateWindowState(windowId, { title: 'Atualizar' })
  }
}

export function clearAllWindowData() {
  // Get all stores
  const windowsStore = useWindowsStore.getState()
  const pagesStore = usePagesStore.getState()
  const formsStore = useFormsStore.getState()

  // Clear windows store
  windowsStore.windows = []
  windowsStore.activeWindow = null
  windowsStore.windowCache = new Map()

  // Clear pages store
  pagesStore.pages = {}

  // Clear forms store
  formsStore.forms = {}

  // Clear localStorage items
  localStorage.removeItem('windows-storage')
  localStorage.removeItem('pages-storage')
  localStorage.removeItem('form-instances-storage')

  // Force Zustand to persist the cleared state
  useWindowsStore.persist.clearStorage()
  usePagesStore.persist.clearStorage()
  useFormsStore.persist.clearStorage()
}

/**
 * Opens a new window for creating an item and sets up communication
 * with the parent window for auto-selection when the item is created.
 */
export function openCreationWindow(
  navigate: (path: string) => void,
  parentWindowId: string,
  route: string,
  updateWindowState: (id: string, updates: Partial<WindowState>) => void,
  findWindowByPathAndInstanceId: (
    path: string,
    instanceId: string
  ) => WindowState | undefined
) {
  const windowId = `create-${Date.now()}`

  // Store the parent window ID in sessionStorage for the new window to access
  sessionStorage.setItem(`parent-window-${windowId}`, parentWindowId)

  // Navigate to the route (this will trigger window manager to create a window)
  navigate(`${route}?instanceId=${windowId}`)

  // Update the window with parent reference after a delay
  setTimeout(() => {
    const createdWindow = findWindowByPathAndInstanceId(route, windowId)

    if (createdWindow) {
      updateWindowState(createdWindow.id, {
        parentWindowId: parentWindowId,
      })
    }
  }, 500)
}

/**
 * Helper function to create custom creation window functions for different entities.
 * This makes it very easy to create specific functions for different entity types.
 */
export function createEntityCreationWindow(route: string) {
  return function openEntityCreationWindow(
    navigate: (path: string) => void,
    parentWindowId: string,
    updateWindowState: (id: string, updates: Partial<WindowState>) => void,
    findWindowByPathAndInstanceId: (
      path: string,
      instanceId: string
    ) => WindowState | undefined
  ) {
    return openCreationWindow(
      navigate,
      parentWindowId,
      route,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }
}



// --- Criação em app para entidades clínicas principais ---
// Estas funções são usadas nas listagens/tabelas para abrir janelas de criação dentro da app.

export function openUtenteCreationInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
) {
  const instanceId = generateInstanceId()
  const basePath = '/utentes/novo'
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: 'Novo Utente',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

export function openUtenteEditInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  id: string,
  nome?: string | null,
) {
  const instanceId = generateInstanceId()
  const basePath = `/utentes/${id}/editar`
  const path = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: nome ? `Utente: ${nome}` : 'Editar Utente',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(path)
}

export function openMedicoCreationInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
) {
  const instanceId = generateInstanceId()
  const basePath = '/medicos/novo'
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: 'Novo Médico',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

export function openMedicoEditInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  id: string,
  nome?: string | null,
) {
  const instanceId = generateInstanceId()
  const basePath = `/medicos/${id}/editar`
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: nome ? `Médico: ${nome}` : 'Editar Médico',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

export function openMedicoViewInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  id: string,
  nome?: string | null,
) {
  const instanceId = generateInstanceId()
  const basePath = `/medicos/${id}`
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: nome ? `Médico: ${nome}` : 'Médico',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

export function openOrganismoCreationInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  parentWindowId?: string,
) {
  const instanceId = generateInstanceId()
  const basePath = '/organismos/novo'
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: 'Novo Organismo',
    instanceId,
    searchParams: { instanceId },
    parentWindowId,
  })
  navigate(fullPath)
}

export function openEmpresaCreationInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
) {
  const instanceId = generateInstanceId()
  const basePath = '/area-comum/tabelas/entidades/empresas/nova'
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: 'Criar Empresa',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

/**
 * Adiciona uma nova tab na barra de janelas da app sem navegar.
 * Mantém a vista atual (e o modal/estado) e quando o utilizador clicar na nova tab é que navega.
 */
export function openPathInNewAppTab(
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  setActiveWindow: (id: string) => void,
  path: string,
  title: string,
) {
  const currentWindowId = getCurrentWindowId()
  const instanceId = generateInstanceId()
  const rawBasePath = path.startsWith('/') ? path : `/${path}`
  const [pathname, queryPart = ''] = rawBasePath.split('?')
  const existingParams = new URLSearchParams(queryPart)
  existingParams.set('instanceId', instanceId)

  addWindow({
    id: instanceId,
    instanceId,
    path: pathname,
    title,
    searchParams: Object.fromEntries(existingParams.entries()),
  })
  if (currentWindowId) {
    setActiveWindow(currentWindowId)
  }
}

/**
 * Abre uma página numa nova tab da barra de janelas e navega para ela (mostra o conteúdo).
 * Mesmo padrão das outras listagens (Organismos, Patologias, etc.).
 */
export function openPathInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  path: string,
  title: string,
) {
  const instanceId = generateInstanceId()
  const rawBasePath = path.startsWith('/') ? path : `/${path}`
  const [pathname, queryPart = ''] = rawBasePath.split('?')
  const existingParams = new URLSearchParams(queryPart)
  existingParams.set('instanceId', instanceId)

  addWindow({
    id: instanceId,
    instanceId,
    path: pathname,
    title,
    searchParams: Object.fromEntries(existingParams.entries()),
  })
  navigate(`${pathname}?${existingParams.toString()}`)
}

export function openPatologiaCreationInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
) {
  const instanceId = generateInstanceId()
  const basePath = '/area-comum/tabelas/tratamentos/patologias/novo'
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: 'Nova Patologia',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

export function openPatologiaEditInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  id: string,
  title: string | null,
  mode: 'view' | 'edit',
) {
  const instanceId = generateInstanceId()
  const basePath =
    mode === 'view'
      ? `/area-comum/tabelas/tratamentos/patologias/${id}/ver`
      : `/area-comum/tabelas/tratamentos/patologias/${id}/editar`
  const fullPath = `${basePath}?instanceId=${instanceId}`
  addWindow({
    id: instanceId,
    path: basePath,
    title: title ?? 'Patologia',
    instanceId,
    searchParams: { instanceId },
  })
  navigate(fullPath)
}

/**
 * Função genérica para abrir uma janela de edição de entidade a partir das Tabelas.
 * Usada por listagens de fornecedores, técnicos, centros de saúde, etc.
 */
export function openEntityEditInApp(
  navigate: (path: string) => void,
  addWindow: (window: Omit<WindowState, 'isMinimized'>) => void,
  path: string,
  _id: string,
  title: string | null,
) {
  const instanceId = generateInstanceId()
  const basePath = path
  const fullPath = `${basePath}?instanceId=${instanceId}`

  addWindow({
    id: instanceId,
    path: basePath,
    title: title ?? 'Detalhe',
    instanceId,
    searchParams: { instanceId },
  })

  navigate(fullPath)
}

export const openPaisCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/paises/create'
)

export const openDistritoCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/distritos/create'
)

export const openConcelhoCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/concelhos/create'
)

export const openFreguesiaCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/freguesias/create'
)

export const openCodigoPostalCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/codigospostais/create'
)

export const openPaisViewWindow = createEntityViewWindow(
  '/utilitarios/tabelas/geograficas/paises/update',
  'paisId'
)

export const openDistritoViewWindow = createEntityViewWindow(
  '/utilitarios/tabelas/geograficas/distritos/update',
  'distritoId'
)

export const openConcelhoViewWindow = createEntityViewWindow(
  '/utilitarios/tabelas/geograficas/concelhos/update',
  'concelhoId'
)

export const openFreguesiaViewWindow = createEntityViewWindow(
  '/utilitarios/tabelas/geograficas/freguesias/update',
  'freguesiaId'
)

export const openCodigoPostalViewWindow = createEntityViewWindow(
  '/utilitarios/tabelas/geograficas/codigospostais/update',
  'codigoPostalId'
)

export const openRuaCreationWindow = createEntityCreationWindow(
  '/utilitarios/tabelas/geograficas/ruas/create'
)

/**
 * Opens a window for viewing/editing an existing entity.
 * This is used when you want to open an entity in update mode.
 */
export function openViewWindow(
  navigate: (path: string) => void,
  parentWindowId: string,
  route: string,
  entityId: string,
  entityIdParamName: string,
  updateWindowState: (id: string, updates: Partial<WindowState>) => void,
  findWindowByPathAndInstanceId: (
    path: string,
    instanceId: string
  ) => WindowState | undefined
) {
  const windowId = `view-${Date.now()}`

  // Store the parent window ID in sessionStorage for the new window to access
  sessionStorage.setItem(`parent-window-${windowId}`, parentWindowId)

  // Navigate to the route with the entity ID parameter
  navigate(`${route}?${entityIdParamName}=${entityId}&instanceId=${windowId}`)

  // Update the window with parent reference after a delay
  setTimeout(() => {
    const createdWindow = findWindowByPathAndInstanceId(route, windowId)

    if (createdWindow) {
      updateWindowState(createdWindow.id, {
        parentWindowId: parentWindowId,
      })
    }
  }, 500)
}

/**
 * Helper function to create custom view window functions for different entities.
 * This makes it very easy to create specific functions for viewing different entity types.
 */
export function createEntityViewWindow(
  route: string,
  entityIdParamName: string
) {
  return function openEntityViewWindow(
    navigate: (path: string) => void,
    parentWindowId: string,
    entityId: string,
    updateWindowState: (id: string, updates: Partial<WindowState>) => void,
    findWindowByPathAndInstanceId: (
      path: string,
      instanceId: string
    ) => WindowState | undefined
  ) {
    return openViewWindow(
      navigate,
      parentWindowId,
      route,
      entityId,
      entityIdParamName,
      updateWindowState,
      findWindowByPathAndInstanceId
    )
  }
}



/**
 * Sets the return data for a window that will be used by the parent window
 * when this window closes. Includes multiple fallback mechanisms for reliability.
 */
export function setWindowReturnData(
  windowId: string,
  data: any,
  setWindowReturnData: (id: string, data: any) => void
) {
  setWindowReturnData(windowId, data)
}

/**
 * Sets return data with multiple fallback mechanisms for maximum reliability.
 */
export function setReturnDataWithFallbacks(
  windowId: string,
  data: any,
  setWindowReturnData: (id: string, data: any) => void,
  parentWindowIdFromStorage?: string
) {
  // Primary mechanism: set return data for the current window
  setWindowReturnData(windowId, data)

  // Fallback mechanism: set return data with parent window ID from storage
  if (parentWindowIdFromStorage) {
    setWindowReturnData(parentWindowIdFromStorage, data)

    // Backup mechanism: store in sessionStorage for longer persistence
    sessionStorage.setItem(
      `return-data-${parentWindowIdFromStorage}`,
      JSON.stringify(data)
    )
  }
}

/**
 * Sets entity-specific return data with multiple fallback mechanisms for maximum reliability.
 * This function uses entity-specific sessionStorage keys to prevent conflicts between different entity types.
 */
export function setEntityReturnDataWithFallbacks(
  windowId: string,
  data: any,
  entityType: string,
  setWindowReturnData: (id: string, data: any) => void,
  parentWindowIdFromStorage?: string
) {
  console.log('[STORAGE] setEntityReturnDataWithFallbacks called:', {
    windowId,
    entityType,
    parentWindowIdFromStorage,
    data,
    normalizedEntityType: entityType.toLowerCase(),
  })

  // Primary mechanism: set return data for the current window
  setWindowReturnData(windowId, data)
  console.log('[STORAGE] Set window return data for windowId:', windowId)

  // Fallback mechanism: set return data with parent window ID from storage
  if (parentWindowIdFromStorage) {
    setWindowReturnData(parentWindowIdFromStorage, data)
    console.log(
      '[STORAGE] Set window return data for parentWindowIdFromStorage:',
      parentWindowIdFromStorage
    )

    // Backup mechanism: store in sessionStorage with entity-specific key for longer persistence
    const sessionKey = `return-data-${parentWindowIdFromStorage}-${entityType.toLowerCase()}`
    sessionStorage.setItem(sessionKey, JSON.stringify(data))
    console.log(
      '[STORAGE] Stored in sessionStorage with key:',
      sessionKey,
      'data:',
      data
    )
  } else {
    console.log(
      '[STORAGE] No parentWindowIdFromStorage provided, skipping sessionStorage storage'
    )
  }
}

/**
 * Sets entity-specific return data with toast suppression to prevent stuttering.
 * This function prevents duplicate toasts when the parent window already shows a success toast.
 */
export function setEntityReturnDataWithToastSuppression(
  windowId: string,
  data: any,
  entityType: string,
  setWindowReturnData: (id: string, data: any) => void,
  parentWindowIdFromStorage?: string,
  instanceId?: string
) {
  // Set return data with fallbacks
  setEntityReturnDataWithFallbacks(
    windowId,
    data,
    entityType,
    setWindowReturnData,
    parentWindowIdFromStorage
  )

  // Set flag to suppress auto-selection toast to prevent stuttering
  // This prevents duplicate toasts when the parent window already shows success
  if (parentWindowIdFromStorage) {
    const suppressionKey = `suppress-auto-selection-toast-${parentWindowIdFromStorage}`
    sessionStorage.setItem(suppressionKey, 'true')
  }

  // Clean up sessionStorage after a delay to ensure parent window has time to read it
  if (parentWindowIdFromStorage && instanceId) {
    setTimeout(() => {
      sessionStorage.removeItem(`parent-window-${instanceId}`)
      // Don't remove the suppression flag here - let useAutoSelection handle it
      // sessionStorage.removeItem(
      //   `suppress-auto-selection-toast-${parentWindowIdFromStorage}`
      // )
    }, 2000) // 2 second delay
  }
}

/**
 * Gets the return data from a child window and clears it.
 */
export function getAndClearWindowReturnData(
  windowId: string,
  getWindowReturnData: (id: string) => any,
  clearWindowReturnData: (id: string) => void
) {
  const data = getWindowReturnData(windowId)
  if (data) {
    clearWindowReturnData(windowId)
  }
  return data
}

/**
 * Checks if there are any child windows with return data for the given parent window.
 */
export function checkForChildWindowReturnData(
  parentWindowId: string,
  findChildWindows: (parentWindowId: string) => WindowState[],
  getWindowReturnData: (id: string) => any
) {
  const childWindows = findChildWindows(parentWindowId)

  for (const childWindow of childWindows) {
    const returnData = getWindowReturnData(childWindow.id)
    if (returnData) {
      return { childWindowId: childWindow.id, returnData }
    }
  }
  return null
}

export function getWindowMetadata(path: string): {
  icon: keyof typeof Icons | null
  color: string
  title: string
} {
  // Helper function to recursively search menu items (including nested items and dropdowns)
  const searchMenuItems = (
    items: ReadonlyArray<{
      href?: string
      icon?: string
      label?: string
      items?: readonly any[]
      dropdown?: readonly any[]
    }>
  ): { icon: keyof typeof Icons; title: string } | null => {
    for (const item of items) {
      // Check if this item matches
      if (item.href === path) {
        return {
          icon: item.icon as keyof typeof Icons,
          title: item.label || '',
        }
      }

      // Check dropdown items if they exist (new structure)
      if (item.dropdown && Array.isArray(item.dropdown)) {
        for (const dropdownItem of item.dropdown) {
          if (dropdownItem.href === path) {
            return {
              icon: dropdownItem.icon as keyof typeof Icons,
              title: dropdownItem.label || '',
            }
          }
        }
      }

      // Check nested items if they exist
      if (item.items && Array.isArray(item.items)) {
        const nestedResult = searchMenuItems(item.items)
        if (nestedResult) {
          return nestedResult
        }
      }
    }
    return null
  }

  // Check ALL menu systems dynamically (cemiterios, utilitarios, canideos, etc.)
  // Iterate through all menus in roleHeaderMenus.client
  const allMenus = roleHeaderMenus.client || {}

  for (const menuKey in allMenus) {
    const menuSections = allMenus[menuKey as keyof typeof allMenus] || []

    // Handle menus with sections that have items (like cemiterios)
    for (const section of menuSections) {
      if ('items' in section && section.items && Array.isArray(section.items)) {
        // First, check direct items
        const sectionResult = searchMenuItems(section.items)
        if (sectionResult) {
          return {
            icon: sectionResult.icon,
            color: '', // Will be set by theme-based system
            title: sectionResult.title,
          }
        }

        // Also check dropdown items within items (new structure)
        for (const item of section.items) {
          if (item.dropdown && Array.isArray(item.dropdown)) {
            for (const dropdownItem of item.dropdown) {
              if (dropdownItem.href === path) {
                return {
                  icon: dropdownItem.icon as keyof typeof Icons,
                  color: '', // Will be set by theme-based system
                  title: dropdownItem.label,
                }
              }
            }
          }
        }
      }
    }
  }

  // If no direct match found, try to find parent route for create/update pages
  const pathSegments = path.split('/').filter(Boolean)

  // For create/update pages, look for the parent route
  if (pathSegments.includes('create') || pathSegments.includes('update')) {
    // Remove the last segment (create/update) and try to find the parent
    const parentPathSegments = pathSegments.slice(0, -1)
    const parentPath = '/' + parentPathSegments.join('/')

    // Helper function to search for parent path in menu items (including dropdowns)
    const searchParentMenuItems = (
      items: ReadonlyArray<{
        href?: string
        icon?: string
        label?: string
        items?: readonly any[]
        dropdown?: readonly any[]
      }>,
      targetPath: string
    ): { icon: keyof typeof Icons; title: string } | null => {
      for (const item of items) {
        // Check if this item matches the parent path
        if (item.href === targetPath) {
          return {
            icon: item.icon as keyof typeof Icons,
            title: item.label || '',
          }
        }

        // Check dropdown items if they exist (new structure)
        if (item.dropdown && Array.isArray(item.dropdown)) {
          for (const dropdownItem of item.dropdown) {
            if (dropdownItem.href === targetPath) {
              return {
                icon: dropdownItem.icon as keyof typeof Icons,
                title: dropdownItem.label || '',
              }
            }
          }
        }

        // Check nested items if they exist
        if (item.items && Array.isArray(item.items)) {
          const nestedResult = searchParentMenuItems(item.items, targetPath)
          if (nestedResult) {
            return nestedResult
          }
        }
      }
      return null
    }

    // Check ALL menu systems for parent (including nested items)
    // Iterate through all menus in roleHeaderMenus.client
    const allMenus = roleHeaderMenus.client || {}

    for (const menuKey in allMenus) {
      const menuSections = allMenus[menuKey as keyof typeof allMenus] || []

      // Handle menus with sections that have items (like cemiterios)
      for (const section of menuSections) {
        if (
          'items' in section &&
          section.items &&
          Array.isArray(section.items)
        ) {
          // First, check direct items for parent path
          const parentResult = searchParentMenuItems(section.items, parentPath)
          if (parentResult) {
            return {
              icon: parentResult.icon,
              color: '', // Will be set by theme-based system
              title: parentResult.title,
            }
          }

          // Also check dropdown items within items (new structure)
          for (const item of section.items) {
            if (item.dropdown && Array.isArray(item.dropdown)) {
              for (const dropdownItem of item.dropdown) {
                if (dropdownItem.href === parentPath) {
                  return {
                    icon: dropdownItem.icon as keyof typeof Icons,
                    color: '', // Will be set by theme-based system
                    title: dropdownItem.label,
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Default metadata
  return {
    icon: null,
    color: 'bg-gray-500',
    title: 'Window',
  }
}
