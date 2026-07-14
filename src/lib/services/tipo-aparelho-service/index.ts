import { TipoAparelhoClient } from './tipo-aparelho-client'

export const TipoAparelhoService = (idFuncionalidade = '') =>
  new TipoAparelhoClient(idFuncionalidade)
export * from './tipo-aparelho-errors'
export * from './tipo-aparelho-client'
