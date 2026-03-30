import { ModeloAparelhoClient } from './modelo-aparelho-client'

export const ModeloAparelhoService = (idFuncionalidade = '') =>
  new ModeloAparelhoClient(idFuncionalidade)
