import { MarcaAparelhoClient } from './marca-aparelho-client'

export const MarcaAparelhoService = (idFuncionalidade = '') =>
  new MarcaAparelhoClient(idFuncionalidade)
export * from './marca-aparelho-errors'
export * from './marca-aparelho-client'
