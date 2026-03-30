import { TaxaIvaClient } from './taxa-iva-client'

export const TaxaIvaService = (idFuncionalidade = '') =>
  new TaxaIvaClient(idFuncionalidade)
