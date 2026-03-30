import { SexoClient } from './sexo-client'

export const SexoService = (idFuncionalidade = '') =>
  new SexoClient(idFuncionalidade)
