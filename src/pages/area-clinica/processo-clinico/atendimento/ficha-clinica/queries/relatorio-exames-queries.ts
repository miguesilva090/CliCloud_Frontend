import { useQuery } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import {
  RelatorioExamesService,
  type RelatorioExamesDTO,
} from '@/lib/services/processo-clinico/relatorio-exames-service'

const client = () => RelatorioExamesService()

export function useGetRelatorioExamesByUtente(utenteId?: string) {
  return useQuery({
    queryKey: ['relatorio-exames', utenteId],
    queryFn: async () => {
      if (!utenteId) return null
      const res = await client().getByUtente(utenteId)
      const info = res.info as GSResponse<RelatorioExamesDTO | null> | null
      return info?.data ?? null
    },
    enabled: !!utenteId && utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export { useUpsertRelatorioExames } from './relatorio-exames-mutations'
