import { useMutation , useQueryClient } from '@tanstack/react-query'
import { DocumentoEmissaoService } from '@/lib/services/faturacao/documento-emissao-service'
import type {
    AnularDocumentoRequest,
    CriarNotaCreditoRequest,
    EmitirDocumentoDesdeAdmissaoRequest,
    EmitirDocumentoDesdeConsultaRequest,
    EmitirDocumentoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'
import { invalidateAdmissaoFaturacaoQueries } from '../../faturacao/utils/invalidate-admissao-faturacao-queries'


type EmitirDesdeAdmissaoArgs = {
    admissaoId: string
    payload: EmitirDocumentoDesdeAdmissaoRequest
}

type EmitirDesdeConsultaArgs = {
    consultaId: string
    payload: EmitirDocumentoDesdeConsultaRequest
}

type AnularDocumentoArgs = {
    documentoId: string
    payload: AnularDocumentoRequest
}

type AtualizarDocumentoArgs = {
    documentoId: string
    payload: EmitirDocumentoRequest
}

export function useEmitirDocumentoMutation(idFuncionalidade = '')
{
    return useMutation({
        mutationFn: (payload: EmitirDocumentoRequest) => 
            DocumentoEmissaoService(idFuncionalidade).emitirDocumento(payload),
    })
}

export function useAtualizarDocumentoEmissaoMutation(idFuncionalidade = '')
{
    return useMutation({
        mutationFn: ({ documentoId, payload }: AtualizarDocumentoArgs) =>
            DocumentoEmissaoService(idFuncionalidade).atualizarDocumento(
                documentoId,
                payload,
            ),
    })
}

export function useEmitirDocumentoDesdeAdmissaoMutation(idFuncionalidade = '')
{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ admissaoId, payload }: EmitirDesdeAdmissaoArgs) =>
            DocumentoEmissaoService(idFuncionalidade).emitirDocumentoDesdeAdmissao(
                admissaoId,
                payload
            ),
        onSuccess: async () => {
            invalidateAdmissaoFaturacaoQueries(queryClient)
        },
    })
}

export function useEmitirDocumentoDesdeConsultaMutation(idFuncionalidade = '')
{
    return useMutation({
        mutationFn: ({ consultaId, payload }: EmitirDesdeConsultaArgs) =>
            DocumentoEmissaoService(idFuncionalidade).emitirDocumentoDesdeConsulta(
                consultaId,
                payload,
            ),
    })
}

export function useAnularDocumentoMutation(idFuncionalidade = '')
{
    const queryClient = useQueryClient()
    return useMutation({
       mutationFn: ({ documentoId, payload }: AnularDocumentoArgs) => 
        DocumentoEmissaoService(idFuncionalidade).anularDocumento(
            documentoId,
            payload,
        ),
        onSuccess: async () => {
            invalidateAdmissaoFaturacaoQueries(queryClient)
        },
    })
}

export function useCriarNotaCreditoMutation(idFuncionalidade = '')
{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload : CriarNotaCreditoRequest) => 
            DocumentoEmissaoService(idFuncionalidade).criarNotaCredito(
                payload,
            ),
        onSuccess: async () => {
            invalidateAdmissaoFaturacaoQueries(queryClient)
        },
    })
}