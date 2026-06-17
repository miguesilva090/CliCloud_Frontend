import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FornecedorService } from '@/lib/services/saude/fornecedor-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateFornecedorRequest,
  UpdateFornecedorRequest,
} from '@/types/dtos/saude/fornecedores.dtos'
import { toast } from '@/utils/toast-utils'
import { BaseApiError } from '@/lib/base-client'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/fornecedores'

function getValidationMessage(error: unknown, fallback: string): string {
  if (!(error instanceof BaseApiError) || error.data == null) return fallback
  const d = error.data
  // Backend validation: { messages: { campo: ['erro1', 'erro2'] } }
  if (typeof d === 'object' && 'messages' in d) {
    const messages = (d as { messages?: Record<string, string[]> }).messages
    if (messages) {
      const flat = Object.entries(messages).flatMap(([, arr]) => arr ?? [])
      const joined = flat.filter(Boolean).join(' ')
      if (joined) return joined
    }
  }
  // BadRequest(ex.Message) pode devolver string ou { message: '...' }
  if (typeof d === 'string') return d
  if (typeof d === 'object' && d !== null && 'message' in d) {
    const msg = (d as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return fallback
}

export const useGetFornecedor = (id: string) =>
  useQuery({
    queryKey: ['fornecedor', id],
    queryFn: () => FornecedorService('fornecedores').getFornecedor(id),
    enabled: !!id,
  })

export const useCreateFornecedor = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateFornecedorRequest) =>
      FornecedorService('fornecedores').createFornecedor(payload),
    onSuccess: (res) => {
      const body = res.info
      if (body?.status === ResponseStatus.Success) {
        toast.success('Fornecedor criado com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['fornecedores-paginated'] })
        navigate(LISTAGEM_PATH, { replace: true })
      } else {
        const msg = body?.messages
          ? Object.values(body.messages)
              .flatMap((arr) => arr ?? [])
              .filter(Boolean)
              .join(' ')
          : ''
        toast.error(msg || 'Falha ao criar fornecedor.')
      }
    },
    onError: (error) => {
      toast.error(getValidationMessage(error, 'Falha ao criar fornecedor.'))
    },
  })
}

export const useUpdateFornecedor = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFornecedorRequest
    }) => FornecedorService('fornecedores').updateFornecedor(id, payload),
    onSuccess: (res) => {
      const body = res.info
      if (body?.status === ResponseStatus.Success) {
        toast.success('Fornecedor atualizado com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['fornecedores-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['fornecedor'] })
        navigate(LISTAGEM_PATH, { replace: true })
      } else {
        const msg = body?.messages
          ? Object.values(body.messages)
              .flatMap((arr) => arr ?? [])
              .filter(Boolean)
              .join(' ')
          : ''
        toast.error(msg || 'Falha ao atualizar fornecedor.')
      }
    },
    onError: (error) => {
      toast.error(getValidationMessage(error, 'Falha ao atualizar fornecedor.'))
    },
  })
}

export const useDeleteFornecedor = ({ onSuccessNavigateTo }: { onSuccessNavigateTo?: string } = {}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => FornecedorService('fornecedores').deleteFornecedor(id),
    onSuccess: (res) => {
      const body = res.info
      if (body?.status === ResponseStatus.Success) {
        toast.success('Fornecedor eliminado com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['fornecedores-paginated'] })
        if (onSuccessNavigateTo) navigate(onSuccessNavigateTo, { replace: true })
      } else {
        const msg = body?.messages
          ? Object.values(body.messages)
              .flatMap((arr) => arr ?? [])
              .filter(Boolean)
              .join(' ')
          : ''
        toast.error(msg || 'Falha ao eliminar fornecedor.')
      }
    },
    onError: (error) => {
      toast.error(getValidationMessage(error, 'Falha ao eliminar fornecedor.'))
    },
  })
}

