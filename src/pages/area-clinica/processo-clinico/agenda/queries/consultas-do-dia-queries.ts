import { useQuery } from '@tanstack/react-query'
import type { ConsultaMarcadaRow } from '../types/consulta-marcada-types'
import type { ConsultaDoDiaDTO } from '@/types/dtos/consultas/consulta.dtos'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'
import { ConsultaService } from '@/lib/services/consultas/consulta-service'

export function useConsultasDoDiaMarcacoes(
  dataStr: string,
  options?: { enabled?: boolean; desmarcadas?: boolean }
) {
  const desmarcadas = options?.desmarcadas ?? false
  const query = useQuery({
    queryKey: ['consultas-do-dia-marcacoes', dataStr, desmarcadas],
    queryFn: async (): Promise<ConsultaMarcadaRow[]> => {
      const res = await MarcacaoConsultaService().getConsultasDoDia(dataStr, desmarcadas)
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

export function useConsultasDoDiaAtendimento(
  dataStr: string,
  options?: { enabled?: boolean; desmarcadas?: boolean }
) {
  const desmarcadas = options?.desmarcadas ?? false
  const query = useQuery({
    queryKey: ['consultas-do-dia-atendimento', dataStr, desmarcadas],
    queryFn: async (): Promise<ConsultaDoDiaDTO[]> => {
      const res = await ConsultaService().getConsultasDoDia({
        data: dataStr,
        desmarcadas,
      })
      const data = res?.info?.data
      if (!Array.isArray(data)) return []
      return data
    },
    enabled: (options?.enabled !== false) && !!dataStr,
    placeholderData: (prev) => prev,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    rows: query.data ?? [],
  }
}
