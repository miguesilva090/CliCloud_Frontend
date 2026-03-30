import { HabilitacaoClient } from './habilitacao-client'

export const HabilitacaoService = (idFuncionalidade = '') =>
  new HabilitacaoClient(idFuncionalidade)
