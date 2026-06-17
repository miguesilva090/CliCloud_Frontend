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

const getValidationMessage = (error: unknown, fallback = 'Falha ao atualizar clínica'): string => {
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
  return fallback
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
      toast.error(getValidationMessage(error, 'Falha ao processar a Clínica.'))
    },
  })
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

