import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { DocumentoService } from '@/lib/services/faturacao/documento-service'
import type {
    AtualizarValidacaoTransporteRequest,
    DocumentoAllFilter,
    EnviarDocumentoEmailRequest,
    DocumentoTableFilter,
} from '@/types/dtos/faturacao/documento.dtos'
import type { PaginatedRequest } from '@/types/api/responses'
import { invalidateAdmissaoFaturacaoQueries } from '../utils/invalidate-admissao-faturacao-queries'

type Sorting = Array<{id: string; desc: boolean}> | null
type Filters = Array<{id: string; value: string}> | null

export const documentoQueryKeys = {
    all: ['documentos-faturacao'] as const,
    list: (keyword: string) => ['documentos-faturacao', 'list', keyword] as const,
    light: (keyword: string) => ['documentos-faturacao', 'light', keyword] as const,
    paginated: (params: DocumentoTableFilter) => 
        ['documentos-faturacao', 'paginated', params] as const,
    allFiltered: (params: DocumentoAllFilter) => 
        ['documentos-faturacao', 'all-filtered', params] as const,
    byId: (id: string) => ['documentos-faturacao', 'by-id', id] as const,
}

/** Cache longo para ver/editar documento — evita refetch ao mudar de tab. */
export const documentoDetailQueryOptions = {
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
} as const

export function prefetchDocumentoById(
    queryClient: QueryClient,
    id: string,
    idFuncionalidade = '',
) {
    if (!id) return Promise.resolve()
    return queryClient.prefetchQuery({
        queryKey: documentoQueryKeys.byId(id),
        queryFn: () => DocumentoService(idFuncionalidade).getDocumentoById(id),
        ...documentoDetailQueryOptions,
    })
}

export function prefetchDocumentosByIds(
    queryClient: QueryClient,
    ids: string[],
    idFuncionalidade = '',
) {
    return Promise.all(
        ids.map((id) => prefetchDocumentoById(queryClient, id, idFuncionalidade)),
    )
}

export function useGetDocumentosPaginated(
    params: DocumentoTableFilter,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: documentoQueryKeys.paginated(params),
        queryFn: () => DocumentoService(idFuncionalidade).getDocumentosPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function useGetDocumentoById(
    id: string, 
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: documentoQueryKeys.byId(id),
        queryFn: () => DocumentoService(idFuncionalidade).getDocumentoById(id),
        enabled: !!id,
        placeholderData: (previousData) => previousData,
        ...documentoDetailQueryOptions,
    })
}

export function useInvalidateDocumentosMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => true,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: documentoQueryKeys.all})
        }
    })
}

export function useGetDocumentosPaginatedPageData(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
    idFuncionalidade = '',
) {
    const params: PaginatedRequest = {
        pageNumber,
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
    }
    return useGetDocumentosPaginated(params, idFuncionalidade)
}

export function usePrefetchAdjacentDocumentos(
    page: number,
    pageSize: number,
    filters: Filters,
    sorting?: Sorting,
    idFuncionalidade = '',
) {
    const queryClient = useQueryClient()
    const baseParams = {
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
    }

    const prefetchPreviousPage = async () => {
        if (page > 1) {
            const params : PaginatedRequest = {...baseParams, pageNumber: page - 1}
            await queryClient.prefetchQuery({
                queryKey: documentoQueryKeys.paginated(params),
                queryFn: () => DocumentoService(idFuncionalidade).getDocumentosPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: PaginatedRequest = {...baseParams, pageNumber: page + 1}
        await queryClient.prefetchQuery({
            queryKey: documentoQueryKeys.paginated(params),
            queryFn: () => DocumentoService(idFuncionalidade).getDocumentosPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage}
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

export function useGetDocumentoLiquidacaoContexto(
    id: string,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: ['documentos-faturacao', 'liquidacao-contexto', id],
        queryFn: () =>
            DocumentoService(idFuncionalidade).getDocumentoLiquidacaoContexto(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}