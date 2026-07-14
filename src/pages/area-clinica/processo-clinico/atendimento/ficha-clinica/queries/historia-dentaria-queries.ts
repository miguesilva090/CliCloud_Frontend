import { useQuery } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import {
  HistoriaDentariaService,
  type CreateHistoriaDentariaRequest,
  type HistoriaDentariaDTO,
} from '@/lib/services/processo-clinico/historia-dentaria-service'

const client = () => HistoriaDentariaService()

export function useGetHistoriaDentariaByUtente(utenteId?: string) {
  return useQuery({
    queryKey: ['historia-dentaria', utenteId],
    queryFn: async (): Promise<HistoriaDentariaDTO[]> => {
      if (!utenteId) return []
      const res = await client().getByUtente(utenteId)
      const info = res.info as GSResponse<HistoriaDentariaDTO[] | null | undefined> | null
      const data = info?.data
      return Array.isArray(data) ? data : []
    },
    enabled: !!utenteId && utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateHistoriaDentaria } from './historia-dentaria-mutations'
