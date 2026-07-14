import { useQuery } from '@tanstack/react-query'
import { ServicoConsultaService } from '@/lib/services/consultas/servico-consulta-service'
import type { ServicoConsultaTableDTO } from '@/types/dtos/consultas/servico-consulta.dtos'

export function useServicoConsultaByConsulta(consultaId?: string) {
  return useQuery({
    queryKey: ['servicos-consulta', consultaId],
    enabled: !!consultaId,
    queryFn: async (): Promise<ServicoConsultaTableDTO[]> => {
      if (!consultaId) return []
      const res = await ServicoConsultaService().getByConsultaAll(consultaId)
      const data = res.info?.data
      if (!Array.isArray(data)) return []
      return data as ServicoConsultaTableDTO[]
    },
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export { useServicoConsultaMutations } from './servico-consulta-mutations'
