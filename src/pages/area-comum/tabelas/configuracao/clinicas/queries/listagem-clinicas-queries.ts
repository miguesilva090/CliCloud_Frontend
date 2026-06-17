import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'
import type { ClinicaTableFilterRequest } from '@/types/dtos/core/clinica.dtos'
import { ClinicaService } from '@/lib/services/core/clinica-service'

export const useGetClinicasPaginated = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null,
) => {
  const params: ClinicaTableFilterRequest = {
    pageNumber: page,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['clinicas-paginated', params],
    queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const usePrefetchAdjacentClinicas = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
) => {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: ClinicaTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['clinicas-paginated', params],
        queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: ClinicaTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }

    await queryClient.prefetchQuery({
      queryKey: ['clinicas-paginated', params],
      queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useSetDefaultClinica = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: string; porDefeito: boolean }) =>
      ClinicaService('tabelas').setClinicaDefault(payload.id, payload.porDefeito),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }

      if (info?.status === ResponseStatus.Success) {
        toast.success('Por defeito atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
        await queryClient.invalidateQueries({ queryKey: ['clinica', 'current'] })
        return
      }

      const msg =
        (response.info as { messages?: Record<string, string[]> })?.messages
          ?.['$']?.[0] ?? 'Falha ao atualizar por defeito da clínica'
      toast.error(msg)
    },
    onError: () => {
      toast.error('Falha ao atualizar por defeito da clínica')
    },
  })
}
