import { useQuery } from '@tanstack/react-query'
import { MedicosService } from '@/lib/services/saude/medicos-service'

export const useMedicosLight = (keyword = '') =>
  useQuery({
    queryKey: ['medicos', 'light', keyword],
    queryFn: () => MedicosService('medicos').getMedicosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })
