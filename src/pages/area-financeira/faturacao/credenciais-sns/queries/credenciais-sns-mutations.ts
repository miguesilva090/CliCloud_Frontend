import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CredenciaisSnsService } from '@/lib/services/faturacao/credenciais-sns-service'
import type {
  CredenciaisSnsModulo,
  DeleteCredenciaisSnsRequest,
} from '@/types/dtos/faturacao/credenciais-sns.dtos'
import {
  CREDENCIAIS_SNS_PERM_ID,
  credenciaisSnsPaginatedQueryKey,
} from './listagem-credenciais-sns-queries'

export function useDeleteCredenciaisSns(modulo: CredenciaisSnsModulo) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DeleteCredenciaisSnsRequest) =>
      CredenciaisSnsService(CREDENCIAIS_SNS_PERM_ID).delete(modulo, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: credenciaisSnsPaginatedQueryKey(modulo),
      })
    },
  })
}

/** @deprecated use useDeleteCredenciaisSns('especialidades') */
export function useDeleteCredenciaisSnsEspecialidades() {
  return useDeleteCredenciaisSns('especialidades')
}
