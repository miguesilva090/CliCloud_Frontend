import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ServicoConsultaService } from '@/lib/services/consultas/servico-consulta-service'
import type { ServicoConsultaTableDTO } from '@/types/dtos/consultas/servico-consulta.dtos'
import type { CreateServicoConsultaBody, UpdateServicoConsultaBody } from '@/lib/services/consultas/servico-consulta-service/servico-consulta-client'

export function useServicoConsultaByConsulta(consultaId?: string) {
  return useQuery({
    queryKey: ['servicos-consulta', consultaId],
    enabled: !!consultaId,
    queryFn: async (): Promise<ServicoConsultaTableDTO[]> => {
      if (!consultaId) return []
      const res = await ServicoConsultaService().getByConsultaAll(consultaId)
      const data = res.info?.data
      if (!Array.isArray(data)) return []
      return data as ServicoConsultaTableDTO[]
    },
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useServicoConsultaMutations() {
  const queryClient = useQueryClient()

  const invalidate = (consultaId: string) =>
    queryClient.invalidateQueries({ queryKey: ['servicos-consulta', consultaId] })

  const create = useMutation({
    mutationFn: async (body: CreateServicoConsultaBody) =>
      ServicoConsultaService().createServicoConsulta(body),
    onSuccess: (_res, variables) => {
      invalidate(variables.consultaId)
    },
  })

  const update = useMutation({
    mutationFn: async (params: { id: string; consultaId: string; body: UpdateServicoConsultaBody }) =>
      ServicoConsultaService().updateServicoConsulta(params.id, params.body),
    onSuccess: (_res, variables) => {
      invalidate(variables.consultaId)
    },
  })

  const remove = useMutation({
    mutationFn: async (params: { id: string; consultaId: string }) =>
      ServicoConsultaService().deleteServicoConsulta(params.id),
    onSuccess: (_res, variables) => {
      invalidate(variables.consultaId)
    },
  })

  return { create, update, remove }
}

