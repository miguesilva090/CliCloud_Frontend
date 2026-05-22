import { useQuery } from '@tanstack/react-query'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'

export function useMarcacoesDisponibilidadeMes(
  listPermId: string,
  especialidadeId: string,
  mes: number,
  ano: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['marcacoes-disponibilidade-mes', especialidadeId, mes, ano],
    queryFn: async () => {
      const res = await MarcacoesAdministrativoService(listPermId).getDisponibilidadeMedicosMes({
        especialidadeId,
        mes,
        ano,
      })
      if (res.info?.status !== ResponseStatus.Success) {
        throw new Error('Não foi possível carregar disponibilidade.')
      }
      return res.info.data ?? []
    },
    enabled: enabled && !!especialidadeId && mes >= 1 && mes <= 12,
    staleTime: 60_000,
  })
}
