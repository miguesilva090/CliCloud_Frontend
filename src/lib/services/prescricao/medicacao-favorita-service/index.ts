import { MedicacaoFavoritaClient } from './medicacao-favorita-client'

export const MedicacaoFavoritaService = (idFuncionalidade = '') =>
  new MedicacaoFavoritaClient(idFuncionalidade)

export * from './medicacao-favorita-client'
