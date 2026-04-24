import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { EmpresaService } from '@/lib/services/saude/empresa-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateEmpresaRequest,
  UpdateEmpresaRequest,
} from '@/types/dtos/saude/empresas.dtos'
import { toast } from '@/utils/toast-utils'
import { BaseApiError } from '@/lib/base-client'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/empresas'

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
  return 'Falha ao criar Empresa'
}

export const useGetEmpresa = (id: string) =>
  useQuery({
    queryKey: ['empresa', id],
    queryFn: () => EmpresaService('empresas').getEmpresa(id),
    enabled: !!id,
  })

export const useCreateEmpresa = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateEmpresaRequest) =>
      EmpresaService('empresas').createEmpresa(payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number; data?: string }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Empresa criada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['empresas-paginated'] })
        navigate(LISTAGEM_PATH)
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao criar Empresa'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Create empresa failed:', error)
      toast.error(getValidationMessage(error))
    },
  })
}

export const useUpdateEmpresa = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateEmpresaRequest) =>
      EmpresaService('empresas').updateEmpresa(id, payload),
    onSuccess: async (response) => {
      const info = response.info as { status?: number }
      if (info?.status === ResponseStatus.Success) {
        toast.success('Empresa atualizada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['empresa', id] })
        await queryClient.invalidateQueries({ queryKey: ['empresas-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao atualizar Empresa'
        toast.error(msg)
      }
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Update empresa failed:', error)
      toast.error(
        error instanceof BaseApiError &&
          error.data &&
          typeof error.data === 'object' &&
          'messages' in error.data
          ? getValidationMessage(error)
          : 'Falha ao atualizar Empresa'
      )
    },
  })
}

