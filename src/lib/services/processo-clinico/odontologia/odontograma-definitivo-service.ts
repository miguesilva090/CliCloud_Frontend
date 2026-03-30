import { OdontogramaDefinitivoClient } from './odontograma-definitivo-client'

export const OdontogramaDefinitivoService = (
  idFuncionalidade = 'PClinico-Odontologia',
) => new OdontogramaDefinitivoClient(idFuncionalidade)

