import { NotificacaoClient } from './notificacao-client'

export const NotificacaoService = (idFuncionalidade = '') =>
  new NotificacaoClient(idFuncionalidade)
export * from './notificacao-errors'
export * from './notificacao-client'
