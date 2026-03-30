import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import { ResponseStatus } from '@/types/api/responses'
import {
  ModelosRelatorioAtestadoService,
  type ModeloRelatorioAtestadoDTO,
  type CreateModeloRelatorioAtestadoRequest,
  type UpdateModeloRelatorioAtestadoRequest,
} from '@/lib/services/processo-clinico/modelos-relatorio-atestado-service'

const client = () => ModelosRelatorioAtestadoService()

export function useGetModelosRelatorioAtestado() {
  return useQuery({
    queryKey: ['modelos-relatorio-atestado'],
    queryFn: async () => {
      const res = await client().getAll()
      const info = res.info as GSResponse<ModeloRelatorioAtestadoDTO[]> | null
      return info?.data ?? []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useCreateModeloRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateModeloRelatorioAtestadoRequest) => {
      const res = await client().create(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao criar modelo de Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modelos-relatorio-atestado'],
      })
    },
  })
}

export function useUpdateModeloRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      id: string
      data: UpdateModeloRelatorioAtestadoRequest
    }) => {
      const res = await client().update(args.id, args.data)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao atualizar modelo de Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modelos-relatorio-atestado'],
      })
    },
  })
}

export function useDeleteModeloRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client().delete(id)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao apagar modelo de Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modelos-relatorio-atestado'],
      })
    },
  })
}

