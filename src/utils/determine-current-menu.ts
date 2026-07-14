import { roleHeaderMenus, roleMenuItems } from '@/config/menu-items'
import type { MenuItem } from '@/types/navigation/menu.types'
import { useAuthStore } from '@/stores/auth-store'
import { useWindowsStore } from '@/stores/use-windows-store'

/** Nó mínimo para percorrer hrefs (compatível com menu-items `as const`). */
type MenuHrefNode = {
  href?: string
  title?: string
  items?: readonly MenuHrefNode[]
  dropdown?: readonly MenuHrefNode[]
}

function normalizeAppPath(path: string): string {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed || '/'
}

function pathMatches(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function flattenMenuHrefs(items: readonly MenuHrefNode[]): string[] {
  const hrefs: string[] = []
  for (const item of items) {
    if (item.href) hrefs.push(item.href)
    if (item.items) hrefs.push(...flattenMenuHrefs(item.items))
    if (item.dropdown) hrefs.push(...flattenMenuHrefs(item.dropdown))
  }
  return hrefs
}

function findWindowForLocation(pathname: string, search: string) {
  const pathKey = normalizeAppPath(pathname)
  const instanceId = new URLSearchParams(search).get('instanceId')
  const { windows, activeWindow } = useWindowsStore.getState()

  if (instanceId) {
    const byInstance = windows.find(
      (w) =>
        w.instanceId === instanceId && normalizeAppPath(w.path) === pathKey
    )
    if (byInstance) return byInstance
  }

  if (activeWindow) {
    const aw = windows.find((w) => w.id === activeWindow)
    if (aw && normalizeAppPath(aw.path) === pathKey) return aw
  }

  return undefined
}

/** Luma: sidebar — href mais específico → title */
function resolveFromSidebar(
  pathname: string,
  menuItems: readonly MenuHrefNode[]
): string {
  let bestTitle = ''
  let bestLen = -1

  const consider = (href: string, title?: string) => {
    if (!title || !pathMatches(href, pathname) || href.length <= bestLen) return
    bestLen = href.length
    bestTitle = title
  }

  for (const item of menuItems) {
    if (item.href) consider(item.href, item.title)
    for (const sub of item.items ?? []) {
      if (sub.href) consider(sub.href, sub.title)
    }
  }

  return bestTitle
}

function resolveFromHeaderMenus(pathname: string, role: string): string {
  const roleMenus = roleHeaderMenus[role as keyof typeof roleHeaderMenus]
  if (!roleMenus) return ''

  let bestKey = ''
  let bestLen = -1
  for (const [menuKey, items] of Object.entries(roleMenus)) {
    for (const href of flattenMenuHrefs(items as readonly MenuHrefNode[])) {
      if (pathMatches(href, pathname) && href.length > bestLen) {
        bestLen = href.length
        bestKey = menuKey
      }
    }
  }

  return bestKey
}

function isValidHeaderMenuKey(
  key: string | undefined,
  role: string
): key is string {
  if (!key) return false
  const roleMenus = roleHeaderMenus[role as keyof typeof roleHeaderMenus]
  return !!roleMenus && key in roleMenus
}

/**
 * Menu lateral e header mantêm o contexto da janela que abriu o ecrã
 * (ex.: SNS em Faturação → Lançamento de Credenciais sem mudar para Área Administrativa).
 */
export function resolveNavigationContext(
  pathname: string,
  search: string,
  menuItems: MenuItem[] = []
): { menuKey: string; contextPath: string } {
  const role = useAuthStore.getState().roleId?.toLowerCase() ?? 'client'
  const win = findWindowForLocation(pathname, search)
  const contextPath = win?.navigationContextPath ?? pathname
  const derived = determineCurrentMenuFromPathname(contextPath, menuItems, role)

  const menuKey = isValidHeaderMenuKey(win?.sidebarMenuKey, role)
    ? win!.sidebarMenuKey!
    : derived

  return { menuKey, contextPath }
}

/**
 * Chave do submenu do header (`roleHeaderMenus`) para um pathname.
 * Resolve a partir de menu-items.ts (sidebar Luma + longest match no header).
 */
export function determineCurrentMenuFromPathname(
  pathname: string,
  menuItems: MenuItem[] = [],
  role = 'client'
): string {
  const sidebarTitle = resolveFromSidebar(pathname, menuItems)
  if (isValidHeaderMenuKey(sidebarTitle, role)) return sidebarTitle

  const fromHeader = resolveFromHeaderMenus(pathname, role)
  if (fromHeader) return fromHeader

  return sidebarTitle
}

/** Sidebar estática para openPathInApp (fora de React hooks). */
export function getSidebarMenuItemsForRole(role: string): MenuItem[] {
  const items =
    roleMenuItems[role as keyof typeof roleMenuItems] ?? roleMenuItems.client
  return JSON.parse(JSON.stringify(items)) as MenuItem[]
}
