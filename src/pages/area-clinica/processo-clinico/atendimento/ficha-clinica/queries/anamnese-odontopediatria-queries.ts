import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnamneseOdontopediatriaService } from '@/lib/services/processo-clinico/estomatologia/anamnese-odontopediatria-service'
import type {
    AnamneseOdontopediatriaDTO,
    CreateAnamneseOdontopediatriaRequest,
    UpdateAnamneseOdontopediatriaRequest,
} from '@/types/dtos/saude/anamnese-odontopediatria.dtos'

const QUERY_KEY = ['anamnese-odontopediatria']

export function useGetAnamneseOdontopediatriaByUtente(utenteId: string) {
    return useQuery({
        queryKey: [ ...QUERY_KEY, 'by-utente', utenteId],
        queryFn: async () => {
            if(!utenteId) {
                return null as AnamneseOdontopediatriaDTO | null
            }

            const res = await AnamneseOdontopediatriaService().getByUtente(utenteId)
            const status = res.info?.status
            if (status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0]
                throw new Error(firstMsg ?? 'Erro ao carregar anamnese odontopediatria')
            }

            // info é GSResponse<AnamneseOdontopediatriaDTO | null>, logo data é o DTO diretamente
            return (res.info?.data ?? null) as AnamneseOdontopediatriaDTO | null
        }, 
        enabled: !!utenteId,
        placeholderData: (prev) => prev,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

export function useCreateAnamneseOdontopediatria(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (
            data: Omit<CreateAnamneseOdontopediatriaRequest, 'utenteId'>,
        ) => {
            const body: CreateAnamneseOdontopediatriaRequest = {
                utenteId, 
                ...data,
            }

            const res = await AnamneseOdontopediatriaService().create(body)
            const status = res.info?.status
            if ( status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0]
                throw new Error(firstMsg ?? 'Erro ao criar Anamnese Odontopediatria')
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

export function useUpdateAnamneseOdontopediatria(utenteId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: {
            id: string, 
            data: UpdateAnamneseOdontopediatriaRequest
        }) => {
            const res = await AnamneseOdontopediatriaService().update(
                payload.id, 
                payload.data
            )
            const status = res.info?.status
            if ( status !== 0) {
                const msgs = res.info?.messages ?? {}
                const firstMsg = Object.values(msgs).flat()[0]
                throw new Error(firstMsg ?? 'Erro ao atualizar Anamnese Odontopediatria')
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

