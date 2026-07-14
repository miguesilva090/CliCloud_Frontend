import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnamneseOrtodonticaAnaliseFuncionalService } from '@/lib/services/processo-clinico/estomatologia/anamnese-ortodontica-analise-funcional-service'
import type {
  CreateAnamneseOrtodonticaAnaliseFuncionalRequest,
  UpdateAnamneseOrtodonticaAnaliseFuncionalRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-funcional.dtos'

const QUERY_KEY = ['anamnese-ortodontica-analise-funcional']

export function useCreateAnamneseOrtodonticaAnaliseFuncional(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (
            data: Omit<CreateAnamneseOrtodonticaAnaliseFuncionalRequest, 'utenteId'>,
        ) => {
            const body: CreateAnamneseOrtodonticaAnaliseFuncionalRequest = {
                utenteId, 
                ...data,
            }

            const res = await AnamneseOrtodonticaAnaliseFuncionalService().create(body)
            const status = res.info?.status
            if (status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0]
                throw new Error(firstMsg ?? 'Erro ao criar Anamnese Ortodôntica - Análise Funcional')
            }
            return res
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [...QUERY_KEY, 'by-utente', utenteId],
            })
        },
    })
}

export function useUpdateAnamneseOrtodonticaAnaliseFuncional(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload:{
            id: string, 
            data: UpdateAnamneseOrtodonticaAnaliseFuncionalRequest
        }) => {
            const res = await AnamneseOrtodonticaAnaliseFuncionalService().update(payload.id, payload.data)
            const status = res.info?.status
            if (status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0]
                throw new Error( firstMsg ?? 'Erro ao atualizar Anamnese Ortodôntica - Análise Funcional')
            }
            return res
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [...QUERY_KEY, 'by-utente', utenteId],
            })
        },
    })
}
