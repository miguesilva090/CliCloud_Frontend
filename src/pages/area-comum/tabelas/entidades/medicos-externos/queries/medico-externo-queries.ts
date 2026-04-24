import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateMedicoExternoRequest,
  UpdateMedicoExternoRequest,
} from '@/types/dtos/saude/medicos-externos.dtos'
import { toast } from '@/utils/toast-utils'
import { BaseApiError } from '@/lib/base-client'

function getValidationMessage(error: unknown): string {
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
  return 'Falha ao criar Médico Externo'
}

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/medicos-externos'

export const useGetMedicoExterno = (id: string) =>
  useQuery({
    queryKey: ['medico-externo', id],
    queryFn: () =>
      MedicoExternoService('medicos-externos').getMedicoExterno(id),
    enabled: !!id,
  })

export const useCreateMedicoExterno = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateMedicoExternoRequest) =>
      MedicoExternoService('medicos-externos').createMedicoExterno(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Médico externo criado com sucesso')
        await queryClient.invalidateQueries({
          queryKey: ['medicos-externos-paginated'],
        })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.[
            '$'
          ]?.[0] ?? 'Falha ao criar Médico Externo'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Create medico externo failed:', error)
      toast.error(getValidationMessage(error))
    },
  })
}

export const useUpdateMedicoExterno = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateMedicoExternoRequest) =>
      MedicoExternoService('medicos-externos').updateMedicoExterno(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Médico externo atualizado com sucesso')
        await queryClient.invalidateQueries({
          queryKey: ['medico-externo', id],
        })
        await queryClient.invalidateQueries({
          queryKey: ['medicos-externos-paginated'],
        })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.[
            '$'
          ]?.[0] ?? 'Falha ao atualizar Médico Externo'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Update medico externo failed:', error)
      toast.error(
        error instanceof BaseApiError &&
          error.data &&
          typeof error.data === 'object' &&
          'messages' in error.data
          ? getValidationMessage(error)
          : 'Falha ao atualizar Médico Externo'
      )
    },
  })
}
