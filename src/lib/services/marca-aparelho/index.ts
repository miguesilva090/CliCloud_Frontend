import { MarcaAparelhoClient } from './marca-aparelho-client'

export const MarcaAparelhoService = (idFuncionalidade = '') =>
  new MarcaAparelhoClient(idFuncionalidade)
