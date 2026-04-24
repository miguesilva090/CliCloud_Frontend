import { NotificacaoTipoClient } from './notificacao-tipo-client'

export const NotificacaoTipoService = (idFuncionalidade = '') =>
  new NotificacaoTipoClient(idFuncionalidade)
