import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CentroSaudeService } from '@/lib/services/saude/centro-saude-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateCentroSaudeRequest,
  UpdateCentroSaudeRequest,
} from '@/types/dtos/saude/centro-saude.dtos'
import { toast } from '@/utils/toast-utils'
import { BaseApiError } from '@/lib/base-client'

function getValidationMessage(error: unknown): string {
  if (error instanceof BaseApiError && error.data && typeof error.data === 'object' && 'messages' in error.data) {
    const messages = (error.data as { messages?: Record<string, string[]> }).messages
    if (messages) {
      const flat = Object.entries(messages).flatMap(([, arr]) => arr ?? [])
      return flat.filter(Boolean).join(' ') || 'Erro de validação.'
    }
  }
  return 'Falha ao criar Centro de Saúde'
}

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/centros-saude'

export const useGetCentroSaude = (id: string) =>
  useQuery({
    queryKey: ['centro-saude', id],
    queryFn: () => CentroSaudeService('tabelas').getCentroSaude(id),
    enabled: !!id,
  })

export const useCreateCentroSaude = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateCentroSaudeRequest) =>
      CentroSaudeService('tabelas').createCentroSaude(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Centro de Saúde criado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['paginated'] })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          'Falha ao criar Centro de Saúde'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Create centro saude failed:', error)
      toast.error(getValidationMessage(error))
    },
  })
}

export const useUpdateCentroSaude = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCentroSaudeRequest) =>
      CentroSaudeService('tabelas').updateCentroSaude(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Centro de Saúde atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['centro-saude', id] })
        await queryClient.invalidateQueries({ queryKey: ['paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          'Falha ao atualizar Centro de Saúde'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Update centro saude failed:', error)
      toast.error(
        error instanceof BaseApiError && error.data && typeof error.data === 'object' && 'messages' in error.data
          ? getValidationMessage(error)
          : 'Falha ao atualizar Centro de Saúde'
      )
    },
  })
}
