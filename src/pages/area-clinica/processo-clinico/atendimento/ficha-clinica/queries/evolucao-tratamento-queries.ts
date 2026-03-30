import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EvolucaoTratamentoService } from '@/lib/services/tratamentos/evolucao-tratamento-service'
import type {
    EvolucaoTratamentoDTO,
    CreateEvolucaoTratamentoRequest,
    UpdateEvolucaoTratamentoRequest,
    EvolucaoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'

type Filters = EvolucaoTratamentoTableFilterRequest['filters']

export function useGetEvolucaoTratamentoById(evolucaoId: string) {
    return useQuery({
        queryKey: ['evolucao-tratamento', 'by-id', evolucaoId],
        queryFn: async () => {
            const res = await EvolucaoTratamentoService().getById(evolucaoId)
            const dto = (res.info?.data ?? null) as EvolucaoTratamentoDTO | null
            return dto && typeof dto === 'object' && 'id' in dto ? dto : null
        },
        enabled: !!evolucaoId && evolucaoId.length > 0,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
    })
}

export function useGetEvolucaoTratamentoPaginated(
    utenteId: string,
    pageNumber: number,
    pageSize: number
) {
    const filters: Filters =
        utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

    const params = {
        pageNumber,
        pageSize,
        filters,
    }

    return useQuery({
        queryKey: ['evolucao-tratamento', 'paginated', utenteId, pageNumber, pageSize],
        queryFn: () => EvolucaoTratamentoService().getPaginated(params),
        enabled: utenteId.length > 0,
        placeholderData: (previousData) => previousData,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

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