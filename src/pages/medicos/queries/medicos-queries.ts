import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CreateMedicoRequest,
  UpdateMedicoRequest,
  MedicoTableFilterRequest,
  CreateHorarioMedicoRequest,
  UpdateHorarioMedicoRequest,
  CreateHorarioMedicoDiaRequest,
  UpdateHorarioMedicoDiaRequest,
} from '@/types/dtos/saude/medicos.dtos'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'

export const useMedicosLight = (keyword = '') =>
  useQuery({
    queryKey: ['medicos', 'light', keyword],
    queryFn: () => MedicosService('medicos').getMedicosLight(keyword),
  })

export const useGetMedico = (id: string) =>
  useQuery({
    queryKey: ['medico', id],
    queryFn: () => MedicosService('medicos').getMedico(id),
    enabled: !!id,
  })

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/medicos'

/** Colunas que o backend ordena sobre `Medico`; ids do TanStack devem coincidir com propriedades da entidade (ex.: nome). */
export const MEDICO_LIST_ALLOWED_SORT_IDS = new Set(['nome'])

export function sanitizeMedicoListSorting(
  sorting: Array<{ id: string; desc: boolean }> | null | undefined
): Array<{ id: string; desc: boolean }> | undefined {
  if (sorting == null || sorting.length === 0) return undefined
  const ok = sorting.filter((s) => MEDICO_LIST_ALLOWED_SORT_IDS.has(s.id))
  return ok.length > 0 ? ok : undefined
}

export const useGetMedicosPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  const params: MedicoTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sanitizeMedicoListSorting(sorting),
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['medicos-paginated', params],
    queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const usePrefetchAdjacentMedicos = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const baseParams: Pick<MedicoTableFilterRequest, 'pageSize' | 'filters'> = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: MedicoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['medicos-paginated', params],
        queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: MedicoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['medicos-paginated', params],
      queryFn: () => MedicosService('medicos').getMedicosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useCreateMedico = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateMedicoRequest) =>
      MedicosService('medicos').createMedico(payload),
    onSuccess: async (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success && info.data) {
        toast.success('Médico criado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
        navigateManagedWindow(navigate, LISTAGEM_PATH)
        return
      }

      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao criar médico'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      console.error('Create medico failed:', error)
      toast.error('Falha ao criar médico')
    },
  })
}

/** Converte a primeira chave de messages do backend (ex.: Nome, PaisId) para nome do campo no form (nome, paisId). */
function getFirstFieldKeyFromBackendMessages(messages: Record<string, string[]> | undefined): string | null {
  if (!messages) return null
  const key = Object.keys(messages).find((k) => k !== '$')
  if (!key) return null
  return normalizeFieldKey(key)
}

/** Normaliza chave do backend para camelCase e corrige typos conhecidos (ex.: dataEmissaoCartaoldentificacao). */
export function normalizeFieldKey(key: string): string {
  const camel = key.charAt(0).toLowerCase() + key.slice(1)
  const typoMap: Record<string, string> = {
    dataEmissaoCartaoldentificacao: 'dataEmissaoCartaoIdentificacao',
    dataValidadeCartaoldentificacao: 'dataValidadeCartaoIdentificacao',
  }
  return typoMap[camel] ?? camel
}

/** Extrai campo e mensagem de erros em formato string (ex.: BadRequest do ASP.NET). */
function parseFieldFromErrorMessage(errorMsg: string): { field: string | null; messages: Record<string, string[]> } {
  const messages: Record<string, string[]> = {}
  const pathMatch = errorMsg.match(/\$\.([a-zA-Z0-9_]+)/)
  if (pathMatch) {
    const rawField = pathMatch[1]
    const field = normalizeFieldKey(rawField)
    messages[field] = [errorMsg]
    return { field, messages }
  }
  messages['$'] = [errorMsg]
  return { field: null, messages }
}

export type UseUpdateMedicoOptions = {
  /** Executado antes do navigate após sucesso. Ex: gravar horário fixo (comportamento do legado). */
  onBeforeNavigate?: () => Promise<void>
  /** Chamado quando o backend devolve erros de validação (400). Permite mostrar erros nos campos e navegar para a tab correta. */
  onServerValidationError?: (fieldKey: string | null, messages: Record<string, string[]>) => void
}

export const useUpdateMedico = (id: string, options?: UseUpdateMedicoOptions) => {
  const queryClient = useQueryClient()
  const { onBeforeNavigate } = options ?? {}

  return useMutation({
    mutationFn: (payload: UpdateMedicoRequest) =>
      MedicosService('medicos').updateMedico(id, payload),
    onSuccess: async (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Médico atualizado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
        await queryClient.invalidateQueries({ queryKey: ['medico', id] })
        await queryClient.invalidateQueries({ queryKey: ['horario-medico', id] })
        try {
          await onBeforeNavigate?.()
        } catch {
          // Erro já tratado em saveHorario (toast). Não navegar para o utilizador poder corrigir.
          return
        }
        // Não navegar para /medicos/:id — perdia instanceId na query e o WindowManager abria tabs extra
        // (redirect Ver→Editar). O ecrã atual mantém-se; dados atualizados via invalidação acima.
        return
      }

      const messages = info.messages ?? (info as { Messages?: Record<string, string[]> }).Messages ?? {}
      const firstError =
        messages['$']?.[0] ||
        Object.values(messages).flat()[0] ||
        'Falha ao atualizar médico'
      toast.error(firstError)
      const fieldKey = getFirstFieldKeyFromBackendMessages(messages)
      options?.onServerValidationError?.(fieldKey ?? null, messages)
    },
    onError: (error: unknown) => {
      console.error('Update medico failed:', error)
      const apiErr = error as { data?: unknown }
      const data = apiErr?.data
      let msg = 'Falha ao atualizar médico'
      let messages: Record<string, string[]> = {}
      let fieldKey: string | null = null

      if (typeof data === 'string') {
        msg = data
        const parsed = parseFieldFromErrorMessage(data)
        fieldKey = parsed.field
        messages = parsed.messages
      } else if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>
        if ('messages' in obj && typeof obj.messages === 'object' && obj.messages !== null) {
          messages = obj.messages as Record<string, string[]>
          const first = messages['$']?.[0] ?? Object.values(messages).flat()[0]
          if (first) msg = first
          fieldKey = getFirstFieldKeyFromBackendMessages(messages)
        } else if ('errors' in obj && typeof obj.errors === 'object' && obj.errors !== null) {
          const errs = obj.errors as Record<string, string[]>
          messages = Object.fromEntries(
            Object.entries(errs).map(([k, v]) => [normalizeFieldKey(k), Array.isArray(v) ? v : [String(v)]])
          )
          const first = Object.values(messages).flat()[0]
          if (first) msg = first
          fieldKey = getFirstFieldKeyFromBackendMessages(messages)
        } else if ('detail' in obj && obj.detail != null) {
          msg = String(obj.detail)
          messages = { $: [msg] }
        }
      }
      toast.error(msg)
      options?.onServerValidationError?.(fieldKey, messages)
    },
  })
}

export const useDeleteMedico = (options?: { onSuccessNavigateTo?: string }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const returnPath = options?.onSuccessNavigateTo ?? '/medicos'

  return useMutation({
    mutationFn: (id: string) => MedicosService('medicos').deleteMedico(id),
    onSuccess: async (response, id) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Médico apagado com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
        await queryClient.removeQueries({ queryKey: ['medico', id] })
        navigate(returnPath)
        return
      }

      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao apagar médico'
      toast.error(firstError)
    },
    onError: (error: unknown) => {
      console.error('Delete medico failed:', error)
      toast.error('Falha ao apagar médico')
    },
  })
}

// Horário Fixo
const svc = () => MedicosService('medicos')

export const useGetHorarioMedicoByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['horario-medico', medicoId],
    queryFn: () => svc().getHorarioMedicoByMedicoId(medicoId),
    enabled: !!medicoId,
    refetchOnMount: 'always',
  })

export const useGetHorarioMedicoDiaByHorarioMedicoId = (horarioMedicoId: string) =>
  useQuery({
    queryKey: ['horario-medico-dia', horarioMedicoId],
    queryFn: () => svc().getHorarioMedicoDiaByHorarioMedicoId(horarioMedicoId),
    enabled: !!horarioMedicoId,
    refetchOnMount: 'always',
  })

export const useCreateHorarioMedico = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHorarioMedicoRequest) => svc().createHorarioMedico(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário gravado')
        await queryClient.invalidateQueries({ queryKey: ['horario-medico', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao gravar horário')
      }
    },
    onError: () => toast.error('Falha ao gravar horário'),
  })
}

export const useUpdateHorarioMedico = (medicoId: string, horarioMedicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateHorarioMedicoRequest) => svc().updateHorarioMedico(horarioMedicoId, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário atualizado')
        await queryClient.invalidateQueries({ queryKey: ['horario-medico', medicoId] })
        await queryClient.invalidateQueries({ queryKey: ['horario-medico-dia', horarioMedicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao atualizar horário')
      }
    },
    onError: () => toast.error('Falha ao atualizar horário'),
  })
}

export const useCreateHorarioMedicoDia = (horarioMedicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateHorarioMedicoDiaRequest) => svc().createHorarioMedicoDia(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        await queryClient.invalidateQueries({ queryKey: ['horario-medico-dia', horarioMedicoId] })
      }
    },
  })
}

export const useUpdateHorarioMedicoDia = (horarioMedicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHorarioMedicoDiaRequest }) =>
      svc().updateHorarioMedicoDia(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['horario-medico-dia', horarioMedicoId] })
    },
  })
}

// Horário Variável
export const useGetHorarioMedicoVariavelByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['horario-medico-variavel', medicoId],
    queryFn: () => svc().getHorarioMedicoVariavelByMedicoId(medicoId),
    enabled: !!medicoId,
  })

export const useCreateHorarioMedicoVariavel = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: import('@/types/dtos/saude/medicos.dtos').CreateHorarioMedicoVariavelRequest) =>
      svc().createHorarioMedicoVariavel(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável gravado')
        await queryClient.invalidateQueries({ queryKey: ['horario-medico-variavel', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao gravar')
      }
    },
    onError: () => toast.error('Falha ao gravar horário variável'),
  })
}

export const useUpdateHorarioMedicoVariavel = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: import('@/types/dtos/saude/medicos.dtos').UpdateHorarioMedicoVariavelRequest }) =>
      svc().updateHorarioMedicoVariavel(id, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável atualizado')
        await queryClient.invalidateQueries({ queryKey: ['horario-medico-variavel', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao atualizar')
      }
    },
    onError: () => toast.error('Falha ao atualizar'),
  })
}

export const useDeleteHorarioMedicoVariavel = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc().deleteHorarioMedicoVariavel(id),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Horário variável removido')
        await queryClient.invalidateQueries({ queryKey: ['horario-medico-variavel', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao remover')
      }
    },
    onError: () => toast.error('Falha ao remover'),
  })
}

// Férias / Folgas
export const useGetFolgasMedicoByMedicoId = (medicoId: string) =>
  useQuery({
    queryKey: ['folgas-medico', medicoId],
    queryFn: () => svc().getFolgasMedicoByMedicoId(medicoId),
    enabled: !!medicoId,
  })

export const useCreateFolgasMedico = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: import('@/types/dtos/saude/medicos.dtos').CreateFolgasMedicoRequest) =>
      svc().createFolgasMedico(payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias gravadas')
        await queryClient.invalidateQueries({ queryKey: ['folgas-medico', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao gravar')
      }
    },
    onError: () => toast.error('Falha ao gravar férias'),
  })
}

export const useUpdateFolgasMedico = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: import('@/types/dtos/saude/medicos.dtos').UpdateFolgasMedicoRequest }) =>
      svc().updateFolgasMedico(id, payload),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias atualizadas')
        await queryClient.invalidateQueries({ queryKey: ['folgas-medico', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao atualizar')
      }
    },
    onError: () => toast.error('Falha ao atualizar'),
  })
}

export const useDeleteFolgasMedico = (medicoId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc().deleteFolgasMedico(id),
    onSuccess: async (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Férias removidas')
        await queryClient.invalidateQueries({ queryKey: ['folgas-medico', medicoId] })
      } else {
        toast.error(Object.values(response.info?.messages || {})?.[0]?.[0] || 'Falha ao remover')
      }
    },
    onError: () => toast.error('Falha ao remover'),
  })
}

