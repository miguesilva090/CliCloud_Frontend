import { isEntityTabelasPath } from '@/config/entity-routes'
import type { MenuItem } from '@/types/navigation/menu.types'

/**
 * Chave do submenu do header (`roleHeaderMenus`) para um pathname.
 * Evita que a sidebar sobrescreva com o `title` do item lateral
 * (ex.: `financeira-faturacao` ≠ `area-financeira`).
 */
export function determineCurrentMenuFromPathname(
  pathname: string,
  menuItems: MenuItem[] = []
): string {
  // Área financeira (incl. entidades em /faturacao/entidades) — antes de isEntityTabelasPath
  if (pathname.startsWith('/area-financeira')) {
    return 'area-financeira'
  }

  if (pathname.startsWith('/area-administrativa')) {
    return 'area-administrativa'
  }

  if (isEntityTabelasPath(pathname)) {
    return 'tabelas'
  }

  if (
    pathname === '/area-clinica' ||
    pathname.startsWith('/area-clinica/processo-clinico')
  ) {
    return 'processo-clinico'
  }

  if (
    pathname.startsWith('/area-administrativa/consultas/sinistrados') ||
    pathname.startsWith('/area-administrativa/consultas/historico-sinistrados') ||
    pathname.startsWith('/area-administrativa/consultas/historico/') ||
    pathname.startsWith('/area-administrativa/credenciais') ||
    pathname.startsWith('/area-administrativa/credenciais/exames-sem-papel') ||
    pathname.startsWith('/area-comum/tabelas/consultas/estado-sinistro')
  ) {
    return 'area-administrativa'
  }

  const nestedCandidates = menuItems
    .flatMap((item) => item.items ?? [])
    .filter(
      (subItem) =>
        pathname === subItem.href ||
        pathname.startsWith(`${subItem.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)

  if (nestedCandidates.length > 0 && nestedCandidates[0].title) {
    return nestedCandidates[0].title
  }

  const directMatch = menuItems.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  if (directMatch?.title) return directMatch.title

  return 'dashboard'
}
