import { TipoDocumentoClient } from '@/lib/services/faturacao/tipo-documento-service/tipo-documento-client'

export const TipoDocumentoService = (idFuncionalidade = '') =>
    new TipoDocumentoClient(idFuncionalidade)
export * from './tipo-documento-errors'
export * from './tipo-documento-client'
