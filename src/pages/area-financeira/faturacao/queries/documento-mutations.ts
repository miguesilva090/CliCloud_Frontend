import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentoService } from '@/lib/services/faturacao/documento-service'
import type {
  AtualizarValidacaoTransporteRequest,
  EnviarDocumentoEmailRequest,
} from '@/types/dtos/faturacao/documento.dtos'
import { invalidateAdmissaoFaturacaoQueries } from '@/pages/area-financeira/faturacao/utils/invalidate-admissao-faturacao-queries'
import { documentoQueryKeys } from './documento-queries'

export function useInvalidateDocumentosMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => true,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all})
        }
    })
}

export function useDocumentoPrintMutation(idFuncionalidade = '') {
    return useMutation({
        mutationFn: (id: string) => DocumentoService(idFuncionalidade).getDocumentoPrint(id),
    })
}

export function useDocumentoPrintOriginalMutation(idFuncionalidade = '') {
    return useMutation({
        mutationFn: (id: string) =>
            DocumentoService(idFuncionalidade).getDocumentoPrintOriginal(id),
    })
}

export function useEnviarDocumentoEmailMutation(idFuncionalidade = '') {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: EnviarDocumentoEmailRequest }) =>
            DocumentoService(idFuncionalidade).enviarDocumentoPorEmail(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all })
        },
    })
}

export function useDocumentoLiquidacaoContextoMutation(idFuncionalidade = '') {
    return useMutation({
        mutationFn: (id: string) =>
            DocumentoService(idFuncionalidade).getDocumentoLiquidacaoContexto(id),
    })
}

export function useLiquidarDocumentoMutation(idFuncionalidade = '') {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => DocumentoService(idFuncionalidade).liquidarDocumento(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all })
            invalidateAdmissaoFaturacaoQueries(queryClient);
        },
    })
}

export function useAtualizarValidacaoTransporteMutation(idFuncionalidade = '') {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AtualizarValidacaoTransporteRequest }) =>
            DocumentoService(idFuncionalidade).atualizarValidacaoTransporte(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all })
        },
    })
}

export function useGetDocumentoByIdMutation(idFuncionalidade = '') {
    return useMutation({
        mutationFn: (id: string) => DocumentoService(idFuncionalidade).getDocumentoById(id),
    })
}

export function useGetDocumentoDetalhesAdmissoesMutation(idFuncionalidade = '') {
    return useMutation({
        mutationFn: (id: string) =>
            DocumentoService(idFuncionalidade).getDocumentoDetalhesAdmissoes(id),
    })
}
