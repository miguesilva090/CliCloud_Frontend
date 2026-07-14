import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { getEntityRoutesForPathname } from '@/config/entity-routes'
import type {
  UtenteTableFilterRequest,
} from '@/types/dtos/saude/utentes.dtos'

export const useUtentesLight = (keyword = '', enabled = true) =>
  useQuery({
    queryKey: ['utentes', 'light', keyword],
    queryFn: () => UtentesService('utentes').getUtentesLight(keyword || undefined),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  })

function listagemUtentesPath() {
  return getEntityRoutesForPathname().utentes.listagem
}

/** Ids aceites pelo backend (`Utente` / Entidade); morada/localidade/telemóvel são calculados na UI — não são propriedades escalar para `OrderBy`. */
export const UTENTE_LIST_ALLOWED_SORT_IDS = new Set([
  'nome',
  'numeroContribuinte',
  'numeroUtente',
])

export function sanitizeUtenteListSorting(
  sorting: Array<{ id: string; desc: boolean }> | null | undefined
): Array<{ id: string; desc: boolean }> | undefined {
  if (sorting == null || sorting.length === 0) return undefined
  const ok = sorting.filter((s) => UTENTE_LIST_ALLOWED_SORT_IDS.has(s.id))
  return ok.length > 0 ? ok : undefined
}

export const useGetUtente = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['utente', id],
    queryFn: () => UtentesService('utentes').getUtente(id),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  })
}

export const useGetUtentesPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  const params: UtenteTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sanitizeUtenteListSorting(sorting),
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['utentes-paginated', params],
    queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const usePrefetchAdjacentUtentes = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: UtenteTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['utentes-paginated', params],
        queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: UtenteTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['utentes-paginated', params],
      queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}


export { useCreateUtente, useUpdateUtente, useDeleteUtente } from './utentes-mutations'
export * from './utente-rnu-queries'
