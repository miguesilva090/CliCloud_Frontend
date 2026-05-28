import { DocumentoEmissaoClient } from '@/lib/services/faturacao/documento-emissao-service/documento-emissao-client'

export const DocumentoEmissaoService = (idFuncionalidade = '') =>
    new DocumentoEmissaoClient(idFuncionalidade)