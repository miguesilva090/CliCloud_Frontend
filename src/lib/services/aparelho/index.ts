import { AparelhoClient } from './aparelho-client'

export const AparelhoService = (idFuncionalidade = '') =>
  new AparelhoClient(idFuncionalidade)
