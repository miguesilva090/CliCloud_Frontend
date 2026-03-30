import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateExameRequest, UpdateExameRequest } from '@/types/dtos/exames/exame'
import type { PaginatedRequest } from '@/types/api/responses'
import { ExameService } from '@/lib/services/exames/exame-service'
import { ResponseStatus } from '@/types/api/responses'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetExamesByUtentePaginated(
  utenteId: string | undefined,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const baseFilters: Array<{ id: string; value: string }> = []

  if (utenteId) {
    // deve coincidir com o id usado no backend (ExameSearchTable)
    baseFilters.push({ id: 'utenteid', value: utenteId })
  }

  const allFilters =
    filters != null && filters.length > 0 ? [...baseFilters, ...filters] : baseFilters

  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: (allFilters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['exames-prescritos-paginated', params],
    queryFn: () => ExameService().getExamesPaginated(params),
    enabled: !!utenteId,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useGetExameById(id: string | null | undefined) {
  return useQuery({
    queryKey: ['exame-by-id', id],
    queryFn: () => ExameService().getExameById(id as string),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useCreateExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExameRequest) => ExameService().createExame(payload),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        // Invalidar todas as queries de exames prescritos (qualquer combinação de filtros/paginação)
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}

export function useUpdateExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: { id: string; data: UpdateExameRequest }) =>
      ExameService().updateExame(args.id, args.data),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}

export function useDeleteExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExameService().deleteExame(id),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}