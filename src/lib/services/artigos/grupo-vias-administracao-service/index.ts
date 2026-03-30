import { GrupoViasAdministracaoClient } from './grupo-vias-administracao-client'

export const GrupoViasAdministracaoService = (idFuncionalidade = '') =>
  new GrupoViasAdministracaoClient(idFuncionalidade)
