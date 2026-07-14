import { OdontogramaDefinitivoClient } from './odontograma-definitivo-client'

export const OdontogramaDefinitivoService = (idFuncionalidade = 'PClinico-Odontologia',) =>
  new OdontogramaDefinitivoClient(idFuncionalidade)

export * from './odontograma-definitivo-client'
export * from './odontograma-definitivo-errors'
