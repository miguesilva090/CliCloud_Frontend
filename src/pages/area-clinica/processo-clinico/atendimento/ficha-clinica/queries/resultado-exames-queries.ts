import { useQuery } from '@tanstack/react-query'
import type { ResultadoExameTableDTO } from '@/types/dtos/exames/resultado-exame.dtos'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { ExameService } from '@/lib/services/exames/exame-service'

export function useGetResultadosByExame(exameId: string | null | undefined) {
  return useQuery<ResponseApi<GSResponse<ResultadoExameTableDTO[]>>>({
    queryKey: ['resultados-exame-by-exame', exameId],
    queryFn: () => ExameService().getResultadosByExame(exameId as string),
    enabled: !!exameId,
    staleTime: 0,
  })
}

export { useUpsertResultadoExame } from './resultado-exames-mutations'
