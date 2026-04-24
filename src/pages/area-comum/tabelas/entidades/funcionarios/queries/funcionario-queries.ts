import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FuncionarioService } from '@/lib/services/saude/funcionario-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
} from '@/types/dtos/saude/funcionarios.dtos'
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
  return 'Falha ao criar Funcionário'
}

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/funcionarios'

export const useGetFuncionario = (id: string) =>
  useQuery({
    queryKey: ['funcionario', id],
    queryFn: () => FuncionarioService('funcionarios').getFuncionario(id),
    enabled: !!id,
  })

export const useCreateFuncionario = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateFuncionarioRequest) =>
      FuncionarioService('funcionarios').createFuncionario(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Funcionário criado com sucesso')
        await queryClient.invalidateQueries({
          queryKey: ['funcionarios-paginated'],
        })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.[
            '$'
          ]?.[0] ?? 'Falha ao criar Funcionário'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Create funcionario failed:', error)
      toast.error(getValidationMessage(error))
    },
  })
}

export const useUpdateFuncionario = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateFuncionarioRequest) =>
      FuncionarioService('funcionarios').updateFuncionario(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Funcionário atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['funcionario', id] })
        await queryClient.invalidateQueries({
          queryKey: ['funcionarios-paginated'],
        })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.[
            '$'
          ]?.[0] ?? 'Falha ao atualizar Funcionário'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      console.error('Update funcionario failed:', error)
      toast.error(
        error instanceof BaseApiError &&
          error.data &&
          typeof error.data === 'object' &&
          'messages' in error.data
          ? getValidationMessage(error)
          : 'Falha ao atualizar Funcionário'
      )
    },
  })
}
