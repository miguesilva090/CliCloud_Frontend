import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EstadosDentariosService } from '@/lib/services/processo-clinico/odontologia/estados-dentarios-service'
import { TiposTratamentoDentarioService } from '@/lib/services/processo-clinico/odontologia/tipos-tratamento-dentario-service'
import { OdontogramaDefinitivoService } from '@/lib/services/processo-clinico/odontologia/odontograma-definitivo-service'
import type {
  EstadosDentariosDTO,
  TiposTratamentoDentarioDTO,
  OdontogramaDefinitivoDTO,
  CreateOdontogramaDefinitivoRequest,
  UpdateOdontogramaDefinitivoRequest,
} from '@/types/dtos/odontologia/odontograma-definitivo.dtos'
import type {
  CreateEstadosDentariosRequest,
  UpdateEstadosDentariosRequest,
} from '@/lib/services/processo-clinico/odontologia/estados-dentarios-client'
import type {
  CreateTiposTratamentoDentarioRequest,
  UpdateTiposTratamentoDentarioRequest,
} from '@/lib/services/processo-clinico/odontologia/tipos-tratamento-dentario-client'

export const ODONTOGRAMA_QUERY_KEY = ['odontologia', 'odontograma-definitivo']

export function useEstadosDentarios(keyword?: string) {
  return useQuery({
    queryKey: ['odontologia', 'estados-dentarios', keyword ?? ''],
    queryFn: async () => {
      const res = await EstadosDentariosService().getAll(keyword ?? '')
      return (res.info?.data ?? []) as EstadosDentariosDTO[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useTiposTratamentoDentario(keyword?: string) {
  return useQuery({
    queryKey: ['odontologia', 'tipos-tratamento-dentario', keyword ?? ''],
    queryFn: async () => {
      const res = await TiposTratamentoDentarioService().getAll(keyword ?? '')
      return (res.info?.data ?? []) as TiposTratamentoDentarioDTO[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useCreateEstadoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateEstadosDentariosRequest) => {
      return EstadosDentariosService().create(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'estados-dentarios'] })
    },
  })
}

export function useUpdateEstadoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateEstadosDentariosRequest }) => {
      return EstadosDentariosService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'estados-dentarios'] })
    },
  })
}

export function useDeleteEstadoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return EstadosDentariosService().delete(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'estados-dentarios'] })
    },
  })
}

export function useCreateTipoTratamentoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTiposTratamentoDentarioRequest) => {
      return TiposTratamentoDentarioService().create(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'tipos-tratamento-dentario'] })
    },
  })
}

export function useUpdateTipoTratamentoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateTiposTratamentoDentarioRequest }) => {
      return TiposTratamentoDentarioService().update(payload.id, payload.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'tipos-tratamento-dentario'] })
    },
  })
}

export function useDeleteTipoTratamentoDentario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return TiposTratamentoDentarioService().delete(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['odontologia', 'tipos-tratamento-dentario'] })
    },
  })
}

export function useOdontogramaByUtenteConsulta(utenteId?: string, consultaId?: string | null) {
  return useQuery({
    queryKey: [...ODONTOGRAMA_QUERY_KEY, utenteId ?? '', consultaId ?? ''],
    enabled: !!utenteId && !!consultaId,
    queryFn: async () => {
      if (!utenteId || !consultaId) {
        return [] as OdontogramaDefinitivoDTO[]
      }
      const res = await OdontogramaDefinitivoService().getByUtenteConsulta(utenteId, consultaId)
      return (res.info?.data ?? []) as OdontogramaDefinitivoDTO[]
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateOdontogramaLinha(utenteId: string, consultaId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateOdontogramaDefinitivoRequest, 'utenteId' | 'consultaId'>) => {
      if (!utenteId || !consultaId) {
        throw new Error('Utente e consulta são obrigatórios para criar uma linha de odontograma.')
      }

      const body: CreateOdontogramaDefinitivoRequest = {
        utenteId,
        consultaId,
        ...data,
      }

      return OdontogramaDefinitivoService().create(body)
    },
    onMutate: async (data) => {
      if (!utenteId || !consultaId) return { previous: undefined as OdontogramaDefinitivoDTO[] | undefined }

      const queryKey = [...ODONTOGRAMA_QUERY_KEY, utenteId, consultaId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<OdontogramaDefinitivoDTO[]>(queryKey)

      const optimistic: OdontogramaDefinitivoDTO = {
        id: `tmp-${Date.now()}`,
        utenteId,
        consultaId,
        numeroDente: data.numeroDente,
        numeroDenteAte: data.numeroDenteAte ?? null,
        codigoSuperficie: data.codigoSuperficie ?? null,
        codigoEstadoPadrao: data.codigoEstadoPadrao ?? null,
        codigoTratamentoPadrao: data.codigoTratamentoPadrao ?? null,
        codigoEstadoPersonalizado: data.codigoEstadoPersonalizado ?? null,
        codigoTratamentoPersonalizado: data.codigoTratamentoPersonalizado ?? null,
        descricao: data.descricao ?? '',
        observacoes: data.observacoes ?? null,
        faturar: data.faturar ?? false,
        quantidade: data.quantidade ?? 1,
        valorServico: data.valorServico ?? null,
        valorUtente: data.valorUtente ?? null,
        valorEntidade: data.valorEntidade ?? null,
        linhaFaturacaoId: data.linhaFaturacaoId ?? null,
        estadoPadrao: null,
        tiposTratamentoPadrao: null,
        createdOn: new Date().toISOString(),
      }

      queryClient.setQueryData<OdontogramaDefinitivoDTO[]>(queryKey, (old) => {
        const arr = old ?? []
        return [optimistic, ...arr]
      })

      return { previous }
    },
    onError: (_err, _data, ctx) => {
      if (!utenteId || !consultaId) return
      const queryKey = [...ODONTOGRAMA_QUERY_KEY, utenteId, consultaId]
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous)
      }
    },
    onSettled: () => {
      if (!utenteId || !consultaId) return
      void queryClient.invalidateQueries({
        queryKey: [...ODONTOGRAMA_QUERY_KEY, utenteId, consultaId],
      })
    },
  })
}

export function useUpdateOdontogramaLinha(
  utenteId: string,
  consultaId: string | null | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: Omit<UpdateOdontogramaDefinitivoRequest, 'utenteId' | 'consultaId'>
    }) => {
      if (!utenteId || !consultaId) {
        throw new Error('Utente e consulta são obrigatórios para atualizar uma linha de odontograma.')
      }

      const body: UpdateOdontogramaDefinitivoRequest = {
        utenteId,
        consultaId,
        ...payload.data,
      }

      return OdontogramaDefinitivoService().update(payload.id, body)
    },
    onSuccess: () => {
      if (utenteId && consultaId) {
        void queryClient.invalidateQueries({
          queryKey: [...ODONTOGRAMA_QUERY_KEY, utenteId, consultaId],
        })
      }
    },
  })
}

export function useDeleteOdontogramaLinha(
  utenteId: string,
  consultaId: string | null | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return OdontogramaDefinitivoService().delete(id)
    },
    onSuccess: () => {
      if (utenteId && consultaId) {
        void queryClient.invalidateQueries({
          queryKey: [...ODONTOGRAMA_QUERY_KEY, utenteId, consultaId],
        })
      }
    },
  })
}

