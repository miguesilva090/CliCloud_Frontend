import { NaturezaDocumentoClient } from './natureza-documento-client'

export const NaturezaDocumentoService = (idFuncionalidade = '') =>
  new NaturezaDocumentoClient(idFuncionalidade)
export * from './natureza-documento-errors'
export * from './natureza-documento-client'
