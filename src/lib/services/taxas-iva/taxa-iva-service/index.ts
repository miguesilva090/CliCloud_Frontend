import { TaxaIvaClient } from './taxa-iva-client'

export const TaxaIvaService = (idFuncionalidade = '') =>
  new TaxaIvaClient(idFuncionalidade)
export * from './taxa-iva-errors'
export * from './taxa-iva-client'
