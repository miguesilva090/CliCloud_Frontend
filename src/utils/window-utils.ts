import { useCallback } from 'react'
import { roleHeaderMenus } from '@/config/menu-items'
import {
  matchPath,
  useLocation,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import {
  usePagesStore,
  type ServicoModalPageDraft,
} from '@/stores/use-pages-store'
import { useWindowsStore, WindowState } from '@/stores/use-windows-store'
import { Icons } from '@/components/ui/icons'
import { utilitariosRoutes } from '@/routes/base/utilitarios-routes'
import { areaComumRoutes } from '@/routes/area-comum/areaComum'
import { areaClinicaRoutes } from '@/routes/area-clinica/areaClinica'
import { reportsRoutes } from '@/routes/reports/reports-routes'
import { areaAdministrativaRoutes } from '@/routes/area-administrativa/areaAdministrativa'


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

/** Resolve tab a fechar quando URL e Router estão dessincronizados (ex.: Sinistrados preso). */
export function resolveWindowIdForClose(): string {
  const fromUrl = getCurrentWindowId()
  if (fromUrl) return fromUrl

  const { activeWindow, windows } = useWindowsStore.getState()
  if (activeWindow) return activeWindow

  const open = windows.filter((w) => !w.isMinimized)
  if (open.length > 0) return open[open.length - 1].id

  if (windows.length > 0) return windows[windows.length - 1].id
  return ''
}

/**
 * Indica se uma rota deve ser gerida pelo sistema de janelas/tabs.
 * Usado em stores de navegação (ex.: use-navigation-history-store)
 * para distinguir entre ecrãs "principais" e páginas simples.
 */
export function shouldManageWindow(pathname: string): boolean {
  const normalizedPath = pathname.startsWith('/')
    ? pathname.substring(1)
    : pathname
  const pathForMatch = pathname.startsWith('/') ? pathname : `/${pathname}`

  const allRoutes = [
    ...utilitariosRoutes,
    ...areaComumRoutes,
    ...areaClinicaRoutes,
    ...reportsRoutes,
    ...areaAdministrativaRoutes,
  ]

  for (const route of allRoutes) {
    if (!route.manageWindow) continue
    if (route.path === normalizedPath) {
      return true
    }
    const pattern = route.path.startsWith('/') ? route.path : `/${route.path}`
    if (matchPath({ path: pattern, end: true }, pathForMatch)) {
      return true
    }
  }

  return false
}

/**
 * Rotas com `manageWindow`: "já focado" só quando a tab activa coincide com URL (path + instanceId).
 */
export function isManagedRouteAlreadyFocused(
  pathname: string,
  search: string,
  pathOnly: string
): boolean {
  if (pathname !== pathOnly) return false
  const urlInstance = new URLSearchParams(search).get('instanceId')
  const { activeWindow, windows } = useWindowsStore.getState()
  const aw = activeWindow ? windows.find((w) => w.id === activeWindow) : undefined
  if (!aw) return false
  return aw.path === pathOnly && aw.instanceId === urlInstance
}

export function getContextualHomePath(pathname: string): string {
  if (pathname.startsWith('/area-administrativa')) {
    return '/area-administrativa/consultas'
  }
  if (pathname.startsWith('/area-comum')) {
    return '/area-comum/tabelas'
  }
  if (pathname.startsWith('/area-clinica')) {
    return '/area-clinica/processo-clinico'
  }
  if (pathname.startsWith('/utilitarios')) {
    return '/utilitarios'
  }
  return '/'
}

/** Prefixo de módulo para limpar tabs ao mudar de área (admin / comum / clínica). */
export function getNavigationAreaPrefix(pathname: string): string {
  if (pathname.startsWith('/area-administrativa')) return 'area-administrativa'
  if (pathname.startsWith('/area-comum')) return 'area-comum'
  if (pathname.startsWith('/area-clinica')) return 'area-clinica'
  if (pathname.startsWith('/utilitarios')) return 'utilitarios'
  return ''
}

/** Navega para o destino de uma janela (path + query) sem reload da página. */
export function navigateToWindowPath(
  navigate: NavigateFunction,
  path: string,
  instanceId: string,
  searchParams?: Record<string, string>
): void {
  const params = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      params.set(key, value)
    })
  }
  params.set('instanceId', instanceId)
  const target = `${path}?${params.toString()}`
  navigate(target, { replace: true })
  requestAnimationFrame(() => {
    const browserPath = window.location.pathname
    if (browserPath !== path) {
      navigate(target, { replace: true })
    }
  })
}

/** Última tab fechada: ir para a home do módulo (ex. área administrativa → /consultas). */
export function navigateToModuleHome(
  navigate: NavigateFunction,
  contextPath?: string
): void {
  const homePath = getContextualHomePath(contextPath || window.location.pathname)
  navigate(homePath, { replace: true })

  // Sinistrados + DataTable: o browser pode reflectir o novo path antes do Router remontar a rota.
  requestAnimationFrame(() => {
    const browserPath = window.location.pathname
    const targetPath = homePath.split('?')[0]
    if (browserPath === targetPath) {
      const full =
        window.location.pathname +
        window.location.search +
        window.location.hash
      navigate(full, { replace: true })
    } else if (browserPath !== targetPath) {
      navigate(homePath, { replace: true })
    }
  })
}

export type NavigateManagedWindowOptions = {
  replace?: boolean
  state?: unknown
  /** Nova tab na barra inferior (novo instanceId). */
  forceNewInstance?: boolean
  /** Título da tab (menu header/sidebar). */
  title?: string
}

function getActiveWindowState(): WindowState | undefined {
  const { activeWindow, windows } = useWindowsStore.getState()
  if (!activeWindow) return undefined
  return windows.find((w) => w.id === activeWindow)
}

function defaultTitleForPath(pathOnly: string): string {
  const segment = pathOnly.split('/').filter(Boolean).pop() ?? 'Janela'
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function navigateManagedWindow(
  navigate: NavigateFunction,
  href: string,
  options?: NavigateManagedWindowOptions
): void {
  if (typeof href !== 'string') return

  const { forceNewInstance, title, ...navigateOptions } = options ?? {}
  const [rawPath, rawQuery = ''] = href.split('?')
  const pathOnly = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

  if (!shouldManageWindow(pathOnly)) {
    navigate(href, navigateOptions)
    return
  }

  const activeWin = getActiveWindowState()
  const isDifferentPath = !!activeWin && activeWin.path !== pathOnly
  const tabTitle = title?.trim() || defaultTitleForPath(pathOnly)

  // Nova rota (ex.: Sinistrados → Médicos): criar tab e janela antes de navegar
  if (forceNewInstance || isDifferentPath) {
    openPathInApp(
      navigate,
      useWindowsStore.getState().addWindow,
      href,
      tabTitle
    )
    return
  }

  if (!forceNewInstance) {
    const windowsOnPath = useWindowsStore.getState().getWindowsByPath(pathOnly)
    if (windowsOnPath.length > 0) {
      const pick = windowsOnPath.reduce((best, w) =>
        (w.lastAccessed ?? 0) >= (best.lastAccessed ?? 0) ? w : best
      )
      const searchParams = new URLSearchParams()
      if (pick.searchParams) {
        Object.entries(pick.searchParams).forEach(([k, v]) => {
          searchParams.set(k, v)
        })
      }
      const hrefParams = new URLSearchParams(rawQuery)
      hrefParams.delete('instanceId')
      hrefParams.forEach((v, k) => {
        searchParams.set(k, v)
      })
      searchParams.set('instanceId', pick.instanceId)
      navigate(`${pathOnly}?${searchParams.toString()}`, navigateOptions)
      useWindowsStore.getState().restoreWindow(pick.id)
      return
    }
  }

  openPathInApp(
    navigate,
    useWindowsStore.getState().addWindow,
    href,
    tabTitle
  )
}

function parseAppHref(href: string): {
  path: string
  searchParams: Record<string, string>
} {
  const [rawPath, rawQuery = ''] = href.split('?')
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const searchParams: Record<string, string> = {}
  new URLSearchParams(rawQuery).forEach((value, key) => {
    if (key !== 'instanceId') {
      searchParams[key] = value
    }
  })
  return { path, searchParams }
}

type AddWindowFn = (
  window: Omit<WindowState, 'isMinimized'>
) => void

/** Regista janela na store e navega com `instanceId` (listagens / + Adicionar). */
export function openPathInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  href: string,
  title: string
): void {
  const { path, searchParams } = parseAppHref(href)
  const instanceId = generateInstanceId()
  const windowId = generateInstanceId()

  addWindow({
    id: windowId,
    instanceId,
    title: truncateWindowTitle(title),
    path,
    hasFormData: false,
    searchParams:
      Object.keys(searchParams).length > 0 ? searchParams : undefined,
  })

  const params = new URLSearchParams(searchParams)
  params.set('instanceId', instanceId)
  navigate(`${path}?${params.toString()}`)
}

export function openPathInAppStandalone(
  navigate: NavigateFunction,
  href: string,
  title: string
): void {
  openPathInApp(
    navigate,
    useWindowsStore.getState().addWindow,
    href,
    title
  )
}

export function openEntityEditInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  editPath: string,
  _entityId: string,
  title: string | null
): void {
  openPathInApp(
    navigate,
    addWindow,
    editPath,
    title?.trim() || 'Editar'
  )
}

export function openUtenteCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(navigate, addWindow, '/utentes/novo', 'Novo utente')
}

export function openUtenteEditInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  id: string,
  nome?: string | null
): void {
  openPathInApp(
    navigate,
    addWindow,
    `/utentes/${id}/editar`,
    nome ? `Utente: ${nome}` : 'Utente'
  )
}

export function openMedicoCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(navigate, addWindow, '/medicos/novo', 'Novo médico')
}

export function openMedicoViewInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  id: string,
  nome?: string | null
): void {
  openPathInApp(
    navigate,
    addWindow,
    `/medicos/${id}`,
    nome ? `Médico: ${nome}` : 'Médico'
  )
}

export function openMedicoEditInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  id: string,
  nome?: string | null
): void {
  openPathInApp(
    navigate,
    addWindow,
    `/medicos/${id}/editar`,
    nome ? `Médico: ${nome}` : 'Médico'
  )
}

export function openOrganismoCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(
    navigate,
    addWindow,
    '/area-comum/tabelas/entidades/organismos/novo',
    'Novo organismo'
  )
}

export function openPatologiaCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(
    navigate,
    addWindow,
    '/area-comum/tabelas/tratamentos/patologias/novo',
    'Nova patologia'
  )
}

export function openPatologiaEditInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  id: string,
  designacao?: string | null,
  mode: 'view' | 'edit' = 'edit'
): void {
  const suffix = mode === 'view' ? 'ver' : 'editar'
  openPathInApp(
    navigate,
    addWindow,
    `/area-comum/tabelas/tratamentos/patologias/${id}/${suffix}`,
    designacao ? `Patologia: ${designacao}` : 'Patologia'
  )
}

export function openSinistradoCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(
    navigate,
    addWindow,
    '/area-administrativa/consultas/sinistrados/novo',
    'Novo sinistrado'
  )
}

export function openLoteDirectCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(
    navigate,
    addWindow,
    '/area-administrativa/credenciais/novo',
    'Lançamento de Credenciais'
  )
}

export function openAdmissaoCreationInApp(
  navigate: NavigateFunction,
  addWindow: AddWindowFn
): void {
  openPathInApp(
    navigate,
    addWindow,
    '/area-administrativa/consultas/admissoes/novo',
    'Nova admissão'
  )
}

/** Abre listagem de subsistemas/serviços numa nova tab (legado Acor_InsLst / Acor_Ins). */
export function openSubsistemasServicosFromAdmissao(
  navigate: NavigateFunction,
  addWindow: AddWindowFn,
  options: {
    admissaoInstanceId: string
    organismoId?: string
    organismoLabel?: string
  }
): void {
  const qs = new URLSearchParams()
  qs.set('fromAdmissao', options.admissaoInstanceId)
  if (options.organismoId) {
    qs.set('organismoId', options.organismoId)
  }
  const orgLabel = options.organismoLabel?.trim()
  const title = orgLabel
    ? `Subsistemas — ${orgLabel.length > 24 ? `${orgLabel.slice(0, 24)}…` : orgLabel}`
    : 'Subsistemas de Serviços'
  openPathInApp(
    navigate,
    addWindow,
    `/area-administrativa/tabelas/subsistemas-servicos?${qs.toString()}`,
    title
  )
}

const SERVICO_MODAL_AUX_DRAFT_KEY = 'servico-modal-aux-draft'

export function persistServicoModalAuxSessionDraft(
  servicosInstanceId: string,
  draft: ServicoModalPageDraft
): void {
  sessionStorage.setItem(
    `${SERVICO_MODAL_AUX_DRAFT_KEY}:${servicosInstanceId}`,
    JSON.stringify(draft)
  )
}

export function readServicoModalAuxSessionDraft(
  servicosInstanceId: string
): ServicoModalPageDraft | null {
  try {
    const raw = sessionStorage.getItem(
      `${SERVICO_MODAL_AUX_DRAFT_KEY}:${servicosInstanceId}`
    )
    if (!raw) return null
    return JSON.parse(raw) as ServicoModalPageDraft
  } catch {
    return null
  }
}

export function clearServicoModalAuxSessionDraft(
  servicosInstanceId: string
): void {
  sessionStorage.removeItem(
    `${SERVICO_MODAL_AUX_DRAFT_KEY}:${servicosInstanceId}`
  )
}

/** Fecha a janela/tab actual como o botão X da barra inferior. */
export function useCloseCurrentWindowLikeTabBar(): () => void {
  const navigate = useNavigate()
  const location = useLocation()
  const removeWindow = useWindowsStore((s) => s.removeWindow)

  return useCallback(() => {
    const windowId = resolveWindowIdForClose()
    if (windowId) {
      handleWindowClose(windowId, navigate, removeWindow)
      return
    }
    navigateToModuleHome(navigate, location.pathname)
  }, [navigate, removeWindow, location.pathname])
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
  navigate: NavigateFunction,
  removeWindow: (id: string) => void
) {
  const currentPath = window.location.pathname
  const windowsStore = useWindowsStore.getState()
  const remainingWindows = windowsStore.windows.filter((w) => w.id !== windowId)

  if (remainingWindows.length > 0) {
    const lastWindow = remainingWindows[remainingWindows.length - 1]
    windowsStore.restoreWindow(lastWindow.id)
    navigateToWindowPath(
      navigate,
      lastWindow.path,
      lastWindow.instanceId,
      lastWindow.searchParams
    )
    removeWindow(windowId)
    return
  }

  // Última tab: limpar store e cache antes de navegar (evita Sinistrados preso no ecrã)
  windowsStore.clearAllWindows()
  navigateToModuleHome(navigate, currentPath)
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

export const openUtenteCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/utentes/novo'
)

export const openMedicoCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/medicos/novo'
)


export const openOrganismoCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/organismos/novo'
)

export const openMedicoExternoCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/medicos-externos/novo'
)

export const openCentroSaudeCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/centros-saude/novo'
)

export const openFuncionarioCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/funcionarios/novo'
)

export const openFornecedorCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/fornecedores/novo'
)

export const openTecnicoCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/tecnicos/novo'
)

export const openEmpresaCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/empresas/nova'
)

export const openSeguradoraCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/entidades/seguradoras/nova'
)

export const openPatologiaCreationWindow = createEntityCreationWindow(
  '/area-comum/tabelas/tratamentos/patologias/novo'
)

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

  sessionStorage.setItem(`parent-window-${windowId}`, parentWindowId)

  navigate(`${route}?${entityIdParamName}=${entityId}&instanceId=${windowId}`)

  setTimeout(() => {
    const createdWindow = findWindowByPathAndInstanceId(route, windowId)

    if (createdWindow) {
      updateWindowState(createdWindow.id, {
        parentWindowId: parentWindowId,
      })
    }
  }, 500)
}

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

export const openUtenteViewWindow = createEntityViewWindow(
  '/area-comum/tabelas/entidades/utentes/update',
  'utenteId'
)

export const openMedicoViewWindow = createEntityViewWindow(
  '/area-comum/tabelas/entidades/medicos/update',
  'medicoId'
)

export const openOrganismoViewWindow = createEntityViewWindow(
  '/area-comum/tabelas/entidades/organismos/update',
  'organismoId'
)

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
