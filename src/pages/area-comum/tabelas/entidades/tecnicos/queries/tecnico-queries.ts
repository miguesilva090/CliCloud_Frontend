import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateTecnicoRequest,
  UpdateTecnicoRequest,
} from '@/types/dtos/saude/tecnicos.dtos'
import { toast } from '@/utils/toast-utils'
import { BaseApiError } from '@/lib/base-client'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/tecnicos'

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
  return 'Falha ao criar Técnico'
}

export const useGetTecnico = (id: string) =>
  useQuery({
    queryKey: ['tecnico', id],
    queryFn: () => TecnicoService('tecnicos').getTecnico(id),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })

export const useCreateTecnico = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateTecnicoRequest) =>
      TecnicoService('tecnicos').createTecnico(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Técnico criado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['tecnicos-paginated'] })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao criar Técnico'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Create tecnico failed:', error)
      toast.error(getValidationMessage(error))
    },
  })
}

export const useUpdateTecnico = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTecnicoRequest) =>
      TecnicoService('tecnicos').updateTecnico(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Técnico atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['tecnico', id] })
        await queryClient.invalidateQueries({ queryKey: ['tecnicos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao atualizar Técnico'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Update tecnico failed:', error)
      toast.error(
        error instanceof BaseApiError &&
          error.data &&
          typeof error.data === 'object' &&
          'messages' in error.data
          ? getValidationMessage(error)
          : 'Falha ao atualizar Técnico'
      )
    },
  })
}

