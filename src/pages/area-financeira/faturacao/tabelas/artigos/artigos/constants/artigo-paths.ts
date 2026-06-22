export const ARTIGO_LISTAGEM_PATH =
  '/area-financeira/faturacao/tabelas/artigos/artigos'

export const artigoRoutes = {
  listagem: ARTIGO_LISTAGEM_PATH,
  novo: `${ARTIGO_LISTAGEM_PATH}/novo`,
  editar: (id: string) => `${ARTIGO_LISTAGEM_PATH}/${id}/editar`,
  ver: (id: string) => `${ARTIGO_LISTAGEM_PATH}/${id}/ver`,
} as const
