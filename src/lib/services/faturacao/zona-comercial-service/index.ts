import { ZonaComercialClient } from './zona-comercial-client'

export const ZonaComercialService = (idFuncionalidade = '') =>
  new ZonaComercialClient(idFuncionalidade)
