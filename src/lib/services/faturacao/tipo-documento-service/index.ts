import { TipoDocumentoClient } from '@/lib/services/faturacao/tipo-documento-service/tipo-documento-client'

export const TipoDocumentoService = (idFuncionalidade = '') =>
    new TipoDocumentoClient(idFuncionalidade)