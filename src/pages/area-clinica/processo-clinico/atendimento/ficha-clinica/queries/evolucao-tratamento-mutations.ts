import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EvolucaoTratamentoService } from '@/lib/services/tratamentos/evolucao-tratamento-service'
import type {
  CreateEvolucaoTratamentoRequest,
  UpdateEvolucaoTratamentoRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'

export function useCreateEvolucaoTratamento(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: Omit<CreateEvolucaoTratamentoRequest, 'utenteId'>) => {
            const body: CreateEvolucaoTratamentoRequest = { utenteId, ...data }
            const res = await EvolucaoTratamentoService().create(body)
            if (res.info?.status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar evolução de tratamento.'
                throw new Error(firstMsg)
            }
            return res
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['evolucao-tratamento', 'paginated', utenteId],
            })
        },
    })
}

export function useUpdateEvolucaoTratamento(utenteId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (payload: { id: string; data: UpdateEvolucaoTratamentoRequest }) => {
            const res = await EvolucaoTratamentoService().update(payload.id, payload.data)
            if (res.info?.status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar evolução de tratamento.'
                throw new Error(String(firstMsg))
            }
            return res
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['evolucao-tratamento', 'paginated', utenteId],
            })
        },
    })
}

export function useDeleteEvolucaoTratamento(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: string[]) => {
            const client = EvolucaoTratamentoService()
            await Promise.all(ids.map((id) => client.delete(id)))
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['evolucao-tratamento', 'paginated', utenteId],
            })
        },
    })
}
