import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateUtenteRequest,
  UpdateUtenteRequest,
  UtenteTableFilterRequest,
} from '@/types/dtos/saude/utentes.dtos'
import { toast } from '@/utils/toast-utils'

export const useUtentesLight = (keyword = '') =>
  useQuery({
    queryKey: ['utentes', 'light', keyword],
    queryFn: () => UtentesService('utentes').getUtentesLight(keyword),
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/utentes'

export const useGetUtente = (id: string) => {
  return useQuery({
    queryKey: ['utente', id],
    queryFn: () => UtentesService('utentes').getUtente(id),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useGetUtentesPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  const params: UtenteTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sorting ?? undefined,
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['utentes-paginated', params],
    queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePrefetchAdjacentUtentes = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: UtenteTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['utentes-paginated', params],
        queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: UtenteTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['utentes-paginated', params],
      queryFn: () => UtentesService('utentes').getUtentesPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useCreateUtente = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateUtenteRequest) =>
      UtentesService('utentes').createUtente(payload),
    onSuccess: async (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success && info.data) {
        toast.success('Utente criado com sucesso')
        // invalidar listagens paginadas
        await queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
        // navegar para listagem
        navigate(LISTAGEM_PATH)
        return
      }

      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao criar utente'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      console.error('Create utente failed:', error)
      const message = error instanceof Error ? error.message : 'Falha ao criar utente'
      toast.error(message, 'Criar utente')
    },
  })
}

/** Converte a primeira chave de messages do backend (ex.: PaisId) para nome do campo no form (paisId). */
function getFirstFieldKeyFromBackendMessages(messages: Record<string, string[]> | undefined): string | null {
  if (!messages) return null
  const key = Object.keys(messages).find((k) => k !== '$')
  if (!key) return null
  return key.charAt(0).toLowerCase() + key.slice(1)
}

export type UseUpdateUtenteOptions = {
  onServerValidationError?: (fieldKey: string | null) => void
}

export const useUpdateUtente = (id: string, options?: UseUpdateUtenteOptions) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: UpdateUtenteRequest) =>
      UtentesService('utentes').updateUtente(id, payload),
    onSuccess: async (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Utente atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
        await queryClient.invalidateQueries({ queryKey: ['utente', id] })
        navigate('/utentes')
        return
      }

      const messages = (info as { messages?: Record<string, string[]> }).messages ?? (info as { Messages?: Record<string, string[]> }).Messages
      const firstError =
        messages?.['$']?.[0] ||
        (messages && Object.values(messages).flat()[0]) ||
        'Falha ao atualizar utente'
      // Log completo para diagnóstico nas DevTools (resposta do servidor)
      console.error('[Update utente] Resposta de erro do servidor:', response)
      toast.error(firstError, 'Ocorreu um erro')

      const fieldKey = getFirstFieldKeyFromBackendMessages(messages ?? undefined)
      options?.onServerValidationError?.(fieldKey ?? null)
    },
    onError: (error: unknown) => {
      // Log completo para diagnóstico nas DevTools (ex.: rede, 500 com body)
      console.error('[Update utente] Erro:', error)
      const err = error as { data?: unknown; message?: string }
      const data = err?.data
      const messages = data && typeof data === 'object' && 'messages' in data
        ? (data as { messages?: Record<string, string[]> }).messages
        : undefined
      const firstMsg =
        messages?.['$']?.[0] ||
        (messages && Object.values(messages).flat()[0]) ||
        (err?.message && String(err.message)) ||
        'Falha ao atualizar utente'
      toast.error(firstMsg, 'Ocorreu um erro')
      const fieldKey = getFirstFieldKeyFromBackendMessages(messages)
      options?.onServerValidationError?.(fieldKey ?? null)
    },
  })
}

export const useDeleteUtente = (options?: { onSuccessNavigateTo?: string }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const returnPath = options?.onSuccessNavigateTo ?? '/utentes'

  return useMutation({
    mutationFn: (id: string) => UtentesService('utentes').deleteUtente(id),
    onSuccess: async (response, id) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Utente apagado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
        await queryClient.removeQueries({ queryKey: ['utente', id] })
        navigate(returnPath)
        return
      }

      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao apagar utente'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      console.error('Delete utente failed:', error)
      toast.error('Falha ao apagar utente')
    },
  })
}

