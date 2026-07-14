import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reciboQueryKeys } from './listagem-recibos-queries'

export function useInvalidateRecibosMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => true,
        onSuccess: async () =>{
            await queryClient.invalidateQueries({ queryKey: reciboQueryKeys.all})
        } 
    })
}
