import { useQuery } from '@tanstack/react-query'
import type { ConsultaMarcadaRow } from '../types/consulta-marcada-types'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'

export function useConsultasDoDiaMarcacoes(
  dataStr: string,
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    queryKey: ['consultas-do-dia-marcacoes', dataStr],
    queryFn: async (): Promise<ConsultaMarcadaRow[]> => {
      const res = await MarcacaoConsultaService().getConsultasDoDia(dataStr)
      const data = res?.info?.data
      if (!Array.isArray(data)) return []
      return data as ConsultaMarcadaRow[]
    },
    enabled: (options?.enabled !== false) && !!dataStr,
    placeholderData: (prev) => prev,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    rows: (query.data ?? []) as ConsultaMarcadaRow[],
  }
}
