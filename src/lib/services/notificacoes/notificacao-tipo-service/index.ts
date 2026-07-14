import { NotificacaoTipoClient } from './notificacao-tipo-client'

export const NotificacaoTipoService = (idFuncionalidade = '') =>
  new NotificacaoTipoClient(idFuncionalidade)
export * from './notificacao-tipo-errors'
export * from './notificacao-tipo-client'
