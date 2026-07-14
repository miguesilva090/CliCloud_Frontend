import { ZonaComercialClient } from './zona-comercial-client'

export const ZonaComercialService = (idFuncionalidade = '') =>
  new ZonaComercialClient(idFuncionalidade)
export * from './zona-comercial-errors'
export * from './zona-comercial-client'
