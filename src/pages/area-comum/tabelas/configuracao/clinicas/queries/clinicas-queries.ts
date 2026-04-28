import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'
import type {
  ClinicaTableFilterRequest,
  UpdateClinicaRequest,
} from '@/types/dtos/core/clinica.dtos'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { BaseApiError } from '@/lib/base-client'

const getValidationMessage = (error: unknown): string => {
  if (
    error instanceof BaseApiError &&
    error.data &&
    typeof error.data === 'object' &&
    'messages' in error.data
  ) {
    const messages = (error.data as { messages?: Record<string, string[]> })
      .messages
    if (messages) {
      const flat = Object.entries(messages).flatMap(([, arr]) => arr ?? [])
      return flat.filter(Boolean).join(' ') || 'Erro de validação.'
    }
  }

  return 'Falha ao processar a Clínica.'
}

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

export const useGetClinica = (id: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['clinica', id],
    queryFn: () => ClinicaService('tabelas').getClinicaById(id),
    enabled: (options?.enabled ?? true) && !!id,
  })

export const useUpdateClinica = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClinicaRequest) =>
      ClinicaService('tabelas').updateClinicaById(id, payload),
    onMutate: () => {
      toast.info('A gravar clínica...')
    },
    onSuccess: async (response) => {
      const info = response.info as { status?: number }

      if (info?.status === ResponseStatus.Success) {
        toast.success('Clínica atualizada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
        await queryClient.invalidateQueries({ queryKey: ['clinica', id] })
        return
      }

      const msg =
        (response.info as { messages?: Record<string, string[]> })?.messages
          ?.['$']?.[0] ?? 'Falha ao atualizar clínica'
      toast.error(msg)
    },
    onError: (error: unknown) => {
      toast.error(getValidationMessage(error))
    },
  })
}

export const useCreateClinica = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClinicaRequest) =>
      ClinicaService('tabelas').createClinica(payload),
    onMutate: () => {
      toast.info('A criar clínica...')
    },
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }

      if (info?.status === ResponseStatus.Success && info.data) {
        toast.success('Clínica criada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
        return
      }

      const msg =
        (response.info as { messages?: Record<string, string[]> })?.messages
          ?.['$']?.[0] ??
        'Falha ao criar clínica'
      toast.error(msg)
      return undefined
    },
    onError: (error: unknown) => {
      toast.error(getValidationMessage(error))
    },
  })
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
    onError: (error: unknown) => {
      toast.error(getValidationMessage(error))
    },
  })
}

