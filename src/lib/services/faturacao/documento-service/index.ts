import { DocumentoClient } from '@/lib/services/faturacao/documento-service/documento-client'

export const DocumentoService = (idFuncionalidade = '') => 
    new DocumentoClient(idFuncionalidade)
export * from './documento-errors'
export * from './documento-client'
