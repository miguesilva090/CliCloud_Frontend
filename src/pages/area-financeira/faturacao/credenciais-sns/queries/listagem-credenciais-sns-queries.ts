import { useQuery, useQueryClient } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import type {
  CredenciaisSnsModulo,
  CredenciaisSnsTableFilter,
} from '@/types/dtos/faturacao/credenciais-sns.dtos'
import { CredenciaisSnsService } from '@/lib/services/faturacao/credenciais-sns-service'

export const CREDENCIAIS_SNS_PERM_ID =
  modules.areaFinanceira.permissions.credenciaisSns.id

/** @deprecated use CREDENCIAIS_SNS_PERM_ID */
export const CREDENCIAIS_SNS_ESPECIALIDADES_PERM_ID = CREDENCIAIS_SNS_PERM_ID

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function credenciaisSnsPaginatedQueryKey(modulo: CredenciaisSnsModulo) {
  return ['credenciais-sns-paginated', modulo] as const
}

function buildParams(
  modulo: CredenciaisSnsModulo,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): CredenciaisSnsTableFilter {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    modulo,
  }
}

export function createCredenciaisSnsPaginatedHook(modulo: CredenciaisSnsModulo) {
  return function useGetCredenciaisSnsPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting
  ) {
    const params = buildParams(modulo, pageNumber, pageSize, filters, sorting)

    return useQuery({
      queryKey: [...credenciaisSnsPaginatedQueryKey(modulo), params],
      queryFn: () =>
        CredenciaisSnsService(CREDENCIAIS_SNS_PERM_ID).getPaginated(modulo, params),
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  }
}

export function createCredenciaisSnsPrefetchHook(modulo: CredenciaisSnsModulo) {
  return function usePrefetchAdjacentCredenciaisSns(
    page: number,
    pageSize: number,
    filters: Filters
  ) {
    const queryClient = useQueryClient()

    const prefetchPreviousPage = async () => {
      if (page <= 1) return
      const params = buildParams(modulo, page - 1, pageSize, filters, null)
      await queryClient.prefetchQuery({
        queryKey: [...credenciaisSnsPaginatedQueryKey(modulo), params],
        queryFn: () =>
          CredenciaisSnsService(CREDENCIAIS_SNS_PERM_ID).getPaginated(modulo, params),
      })
    }

    const prefetchNextPage = async () => {
      const params = buildParams(modulo, page + 1, pageSize, filters, null)
      await queryClient.prefetchQuery({
        queryKey: [...credenciaisSnsPaginatedQueryKey(modulo), params],
        queryFn: () =>
          CredenciaisSnsService(CREDENCIAIS_SNS_PERM_ID).getPaginated(modulo, params),
      })
    }

    return { prefetchPreviousPage, prefetchNextPage }
  }
}

/** Compatibilidade com código que ainda importa o hook de especialidades. */
export const useGetCredenciaisSnsEspecialidadesPaginated =
  createCredenciaisSnsPaginatedHook('especialidades')

export const usePrefetchAdjacentCredenciaisSnsEspecialidades =
  createCredenciaisSnsPrefetchHook('especialidades')
