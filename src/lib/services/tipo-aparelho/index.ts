import { TipoAparelhoClient } from './tipo-aparelho-client'

export const TipoAparelhoService = (idFuncionalidade = '') =>
  new TipoAparelhoClient(idFuncionalidade)
