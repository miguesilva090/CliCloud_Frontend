import { NaturezaDocumentoClient } from './natureza-documento-client'

export const NaturezaDocumentoService = (idFuncionalidade = '') =>
  new NaturezaDocumentoClient(idFuncionalidade)
