import { useQuery } from '@tanstack/react-query'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'

import type {
  CreateTratamentoRequest,
  TratamentoAllFilterRequest,
  TratamentoTableDTO,
} from '@/types/dtos/tratamentos/tratamento.dtos'

export function useGetTratamentosByUtente(utenteId: string) {
  return useQuery({
    queryKey: ['tratamentos', 'by-utente', utenteId],
    queryFn: async () => {
      if (!utenteId) {
        return [] as TratamentoTableDTO[]
      }

      const body: TratamentoAllFilterRequest = {
        filters: utenteId ? [{ id: 'utenteId', value: utenteId }] : [],
        sorting: [{ id: 'dataInic', desc: true }],
      }

      const res = await TratamentoService().getAll(body)
      return (res.info?.data ?? []) as TratamentoTableDTO[]
    },
    enabled: !!utenteId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateTratamento } from './tratamentos-mutations'
