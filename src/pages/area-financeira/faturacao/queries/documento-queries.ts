import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { DocumentoService } from '@/lib/services/faturacao/documento-service'
import type {
  AtualizarValidacaoTransporteRequest,
  DocumentoAllFilter,
  EnviarDocumentoEmailRequest,
  DocumentoTableFilter,
} from '@/types/dtos/faturacao/documento.dtos'

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

export { useInvalidateDocumentosMutation, useDocumentoPrintMutation, useDocumentoPrintOriginalMutation, useEnviarDocumentoEmailMutation, useDocumentoLiquidacaoContextoMutation, useLiquidarDocumentoMutation, useAtualizarValidacaoTransporteMutation, useGetDocumentoByIdMutation, useGetDocumentoDetalhesAdmissoesMutation } from './documento-mutations'
