import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import type { UpdateClinicaRequest } from '@/types/dtos/core/clinica.dtos'
import { BaseApiError } from '@/lib/base-client'
export const useGetClinicaCurrent = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['clinica', 'current'],
    queryFn: () => ClinicaService('tabelas').getClinicaCurrent(),
    enabled: options?.enabled ?? true,
  })

const getFirstErrorFromMessages = (
  messages: Record<string, string[]> | undefined,
) => {
  if (!messages) return null
  return messages['$']?.[0] ?? Object.values(messages).flat()[0] ?? null
}

const getValidationMessage = (error: unknown): string => {
  if (
    error instanceof BaseApiError &&
    error.data &&
    typeof error.data === 'object' &&
    'messages' in error.data
  ) {
    const messages = (error.data as { messages?: Record<string, string[]> })
      .messages
    const first = getFirstErrorFromMessages(messages)
    if (first) return first
  }
  return 'Falha ao atualizar clínica'
}

export const useUpdateClinicaCurrent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClinicaRequest) =>
      ClinicaService('tabelas').updateClinicaCurrent(payload),
    onMutate: () => {
      toast.info('A gravar clínica...')
    },
    onSuccess: async (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Clínica atualizada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['clinica', 'current'] })
        await queryClient.invalidateQueries({ queryKey: ['clinica'] })
        await queryClient.invalidateQueries({ queryKey: ['clinicas-paginated'] })
        return
      }

      const firstError =
        getFirstErrorFromMessages(info.messages) ?? 'Falha ao atualizar clínica'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      toast.error(getValidationMessage(error))
    },
  })
}

