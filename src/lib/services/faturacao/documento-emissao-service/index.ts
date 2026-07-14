import { DocumentoEmissaoClient } from '@/lib/services/faturacao/documento-emissao-service/documento-emissao-client'

export const DocumentoEmissaoService = (idFuncionalidade = '') =>
    new DocumentoEmissaoClient(idFuncionalidade)
export * from './documento-emissao-errors'
export * from './documento-emissao-client'
