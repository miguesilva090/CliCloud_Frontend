import { useQuery } from '@tanstack/react-query'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'

export type StatusConsultaOption = { value: number; label: string }

export function useStatusConsultaOptions() {
  const query = useQuery({
    queryKey: ['status-consulta-options'],
    queryFn: async () => {
      const res = await MarcacaoConsultaService().getStatusConsultaOptions()
      const data = res?.info?.data
      if (!Array.isArray(data)) return [] as StatusConsultaOption[]
      return data
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const options = (query.data ?? []) as StatusConsultaOption[]
  const getLabel = (value?: number | null): string => {
    if (value == null) return '—'
    const opt = options.find((o) => o.value === value)
    return opt?.label ?? String(value)
  }

  return {
    ...query,
    options,
    getLabel,
  }
}
