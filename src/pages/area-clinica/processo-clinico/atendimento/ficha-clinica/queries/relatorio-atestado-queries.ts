import { useQuery } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import {
  RelatorioAtestadoService,
  type RelatorioAtestadoDTO,
} from '@/lib/services/processo-clinico/relatorio-atestado-service'

const client = () => RelatorioAtestadoService()

export function useGetRelatoriosAtestadoByUtente(utenteId?: string) {
  return useQuery({
    queryKey: ['relatorio-atestado', utenteId],
    queryFn: async () => {
      if (!utenteId) return [] as RelatorioAtestadoDTO[]
      const res = await client().getByUtente(utenteId)
      const info = res.info as GSResponse<RelatorioAtestadoDTO[]> | null
      return info?.data ?? []
    },
    enabled: !!utenteId && utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export {
  useCreateRelatorioAtestado,
  useUpdateRelatorioAtestado,
  useDeleteRelatorioAtestado,
  useAssinarRelatorioAtestado,
} from './relatorio-atestado-mutations'
