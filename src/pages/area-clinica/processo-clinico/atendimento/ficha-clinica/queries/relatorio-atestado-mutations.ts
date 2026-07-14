import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import {
  RelatorioAtestadoService,
  type CreateRelatorioAtestadoRequest,
  type UpdateRelatorioAtestadoRequest,
} from '@/lib/services/processo-clinico/relatorio-atestado-service'

const client = () => RelatorioAtestadoService()

export function useCreateRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRelatorioAtestadoRequest) => {
      const res = await client().create(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao criar Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['relatorio-atestado', vars.utenteId],
      })
    },
  })
}

export function useUpdateRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      id: string
      data: UpdateRelatorioAtestadoRequest
    }) => {
      const res = await client().update(args.id, args.data)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao atualizar Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['relatorio-atestado', vars.data.utenteId],
      })
    },
  })
}

export function useDeleteRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: { id: string; utenteId: string }) => {
      const res = await client().delete(args.id)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao apagar Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['relatorio-atestado', vars.utenteId],
      })
    },
  })
}

export function useAssinarRelatorioAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (args: { id: string; utenteId: string }) => {
      const res = await client().assinar(args.id)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao assinar Relatório/Atestado.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['relatorio-atestado', vars.utenteId],
      })
    },
  })
}
