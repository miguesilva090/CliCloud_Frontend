import { MedicacaoCronicaClient } from './medicacao-cronica-client'

export const MedicacaoCronicaService = (idFuncionalidade = '') =>
  new MedicacaoCronicaClient(idFuncionalidade)

export * from './medicacao-cronica-client'
