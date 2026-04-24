import { NotificacaoClient } from './notificacao-client'

export const NotificacaoService = (idFuncionalidade = '') =>
  new NotificacaoClient(idFuncionalidade)
