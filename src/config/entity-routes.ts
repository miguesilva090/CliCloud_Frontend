export type EntityRouteSet = {
  listagem: string
  novo: string
  detail: (id: string) => string
  editar: (id: string) => string
}

export type EntityRoutesMap = {
  utentes: EntityRouteSet
  medicos: EntityRouteSet
  organismos: EntityRouteSet
  fornecedores: EntityRouteSet
  tecnicos: EntityRouteSet
}

const AREA_COMUM_ENTIDADES_BASE = '/area-comum/tabelas/entidades'
const AREA_ADMIN_ENTIDADES_BASE = '/area-administrativa/entidades'
const FATURACAO_ENTIDADES_BASE = '/area-financeira/faturacao/entidades'
const AREA_ADMIN_TRATAMENTOS_ENTIDADES =
  '/area-administrativa/tratamentos/entidades'

const TRATAMENTOS_TECNICO_SEGMENTS = [
  'fisioterapeutas',
  'tecnicos-auxiliares',
  'terapeutas-ocupacionais',
] as const

function buildEntityRoutesForBase(basePath: string): EntityRoutesMap {
  const r = (entity: string): EntityRouteSet => ({
    listagem: `${basePath}/${entity}`,
    novo: `${basePath}/${entity}/novo`,
    detail: (id: string) => `${basePath}/${entity}/${id}`,
    editar: (id: string) => `${basePath}/${entity}/${id}/editar`,
  })

  return {
    utentes: r('utentes'),
    medicos: r('medicos'),
    organismos: r('organismos'),
    fornecedores: r('fornecedores'),
    tecnicos: r('tecnicos'),
  }
}

function buildRouteSetFromBase(base: string): EntityRouteSet {
  return {
    listagem: base,
    novo: `${base}/novo`,
    detail: (id: string) => `${base}/${id}`,
    editar: (id: string) => `${base}/${id}/editar`,
  }
}

/** Match `/…/entidades/{segment}` ou `/…/entidades/{segment}/…` */
export function matchTratamentosTecnicoBase(pathname: string): string | null {
  for (const seg of TRATAMENTOS_TECNICO_SEGMENTS) {
    const base = `${AREA_ADMIN_TRATAMENTOS_ENTIDADES}/${seg}`
    if (pathname === base || pathname.startsWith(`${base}/`)) return base
  }
  return null
}

export const tratamentosFisioterapeutasRoutes = buildRouteSetFromBase(
  `${AREA_ADMIN_TRATAMENTOS_ENTIDADES}/fisioterapeutas`
)

export const tratamentosAuxiliaresRoutes = buildRouteSetFromBase(
  `${AREA_ADMIN_TRATAMENTOS_ENTIDADES}/tecnicos-auxiliares`
)

export const tratamentosTerapeutasOcupRoutes = buildRouteSetFromBase(
  `${AREA_ADMIN_TRATAMENTOS_ENTIDADES}/terapeutas-ocupacionais`
)

/** Rotas canónicas de entidades (área comum → tabelas → entidades). */
export const entityRoutes = buildEntityRoutesForBase(AREA_COMUM_ENTIDADES_BASE)

export const faturacaoEntityRoutes = buildEntityRoutesForBase(
  FATURACAO_ENTIDADES_BASE
)

function resolvePathnameForEntityRoutes(pathname?: string): string {
  if (pathname?.trim()) return pathname
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return window.location.pathname
  }
  return AREA_COMUM_ENTIDADES_BASE
}

export function resolveEntidadesBasePath(pathname?: string): string {
  const path = resolvePathnameForEntityRoutes(pathname)
  if (path.startsWith(FATURACAO_ENTIDADES_BASE)) {
    return FATURACAO_ENTIDADES_BASE
  }
  if (path.startsWith(AREA_ADMIN_ENTIDADES_BASE)) {
    return AREA_ADMIN_ENTIDADES_BASE
  }
  const tratamentosBase = matchTratamentosTecnicoBase(path)
  if (tratamentosBase) return tratamentosBase
  return AREA_COMUM_ENTIDADES_BASE
}

export function getEntityRoutesForPathname(pathname?: string): EntityRoutesMap {
  const path = resolvePathnameForEntityRoutes(pathname)
  const tratamentosBase = matchTratamentosTecnicoBase(path)
  if (tratamentosBase) {
    return {
      ...buildEntityRoutesForBase(AREA_COMUM_ENTIDADES_BASE),
      tecnicos: buildRouteSetFromBase(tratamentosBase),
    }
  }
  return buildEntityRoutesForBase(resolveEntidadesBasePath(pathname))
}

const LEGACY_ENTITY_PREFIXES = [
  '/utentes',
  '/medicos',
  '/organismos',
  '/fornecedores',
] as const

/** Rotas de entidades sob o header «Tabelas» da área comum (não faturação nem administrativa). */
export function isEntityTabelasPath(pathname: string): boolean {
  return (
    pathname.startsWith(`${AREA_COMUM_ENTIDADES_BASE}/`) ||
    LEGACY_ENTITY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}