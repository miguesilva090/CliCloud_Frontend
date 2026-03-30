import { DoencaClient } from './doenca-client'

export const DoencaService = (idFuncionalidade = '') =>
  new DoencaClient(idFuncionalidade)
