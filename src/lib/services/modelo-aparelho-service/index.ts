import { ModeloAparelhoClient } from './modelo-aparelho-client'

export const ModeloAparelhoService = (idFuncionalidade = '') =>
  new ModeloAparelhoClient(idFuncionalidade)
export * from './modelo-aparelho-errors'
export * from './modelo-aparelho-client'
