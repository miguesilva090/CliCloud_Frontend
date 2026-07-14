import { HabilitacaoClient } from './habilitacao-client'

export const HabilitacaoService = (idFuncionalidade = '') =>
  new HabilitacaoClient(idFuncionalidade)
export * from './habilitacao-errors'
export * from './habilitacao-client'
