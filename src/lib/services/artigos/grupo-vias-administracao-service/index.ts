import { GrupoViasAdministracaoClient } from './grupo-vias-administracao-client'

export const GrupoViasAdministracaoService = (idFuncionalidade = '') =>
  new GrupoViasAdministracaoClient(idFuncionalidade)
export * from './grupo-vias-administracao-errors'
export * from './grupo-vias-administracao-client'
