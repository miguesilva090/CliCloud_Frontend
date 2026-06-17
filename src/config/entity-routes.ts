/** Rotas canónicas de entidades (área comum → tabelas → entidades). */
export const entityRoutes = {
  utentes: {
    listagem: '/area-comum/tabelas/entidades/utentes',
    novo: '/area-comum/tabelas/entidades/utentes/novo',
    detail: (id: string) => `/area-comum/tabelas/entidades/utentes/${id}`,
    editar: (id: string) => `/area-comum/tabelas/entidades/utentes/${id}/editar`,
  },
  medicos: {
    listagem: '/area-comum/tabelas/entidades/medicos',
    novo: '/area-comum/tabelas/entidades/medicos/novo',
    detail: (id: string) => `/area-comum/tabelas/entidades/medicos/${id}`,
    editar: (id: string) => `/area-comum/tabelas/entidades/medicos/${id}/editar`,
  },
  organismos: {
    listagem: '/area-comum/tabelas/entidades/organismos',
    novo: '/area-comum/tabelas/entidades/organismos/novo',
    detail: (id: string) => `/area-comum/tabelas/entidades/organismos/${id}`,
    editar: (id: string) =>
      `/area-comum/tabelas/entidades/organismos/${id}/editar`,
  },
  fornecedores: {
    listagem: '/area-comum/tabelas/entidades/fornecedores',
    novo: '/area-comum/tabelas/entidades/fornecedores/novo',
    detail: (id: string) => `/area-comum/tabelas/entidades/fornecedores/${id}`,
    editar: (id: string) =>
      `/area-comum/tabelas/entidades/fornecedores/${id}/editar`,
  },
} as const

const LEGACY_ENTITY_PREFIXES = [
  '/utentes',
  '/medicos',
  '/organismos',
  '/fornecedores',
] as const

/** Deteta rotas de entidades (canónicas ou legacy) para menu/header. */
export function isEntityTabelasPath(pathname: string): boolean {
  return (
    pathname.startsWith('/area-comum/tabelas/entidades/') ||
    LEGACY_ENTITY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}
