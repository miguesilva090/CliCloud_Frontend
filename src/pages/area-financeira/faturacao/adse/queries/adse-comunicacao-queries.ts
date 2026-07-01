import { useQuery } from '@tanstack/react-query'
import { AdseComunicacaoService } from '@/lib/services/faturacao/adse-service'
import type {
  AdseComunicacaoModulo,
  AdseComunicacaoTableFilter,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import { ADSE_PERM_ID } from './adse-config-queries'
import { ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'

export const adseComunicacaoPaginatedKey = (
  modulo: AdseComunicacaoModulo,
  filter: AdseComunicacaoTableFilter,
) => ['adse', 'comunicacao', modulo, filter]

export function useAdseComunicacaoPaginatedQuery(
  modulo: AdseComunicacaoModulo,
  filter: AdseComunicacaoTableFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: adseComunicacaoPaginatedKey(modulo, filter),
    queryFn: () => AdseComunicacaoService(ADSE_PERM_ID).getPaginated(modulo, filter),
    enabled,
  })
}

export function useAdsePreFaturasAbertasQuery(modulo: AdseComunicacaoModulo) {
  const tipo = ADSE_TIPO_PRE_FATURA[modulo]
  return useQuery({
    queryKey: ['adse', 'pre-faturas', 'abertas', modulo],
    queryFn: () => AdseComunicacaoService(ADSE_PERM_ID).listarPreFaturasAbertas(tipo),
  })
}

export function useAdsePreFaturasPorEstadoQuery(
  modulo: AdseComunicacaoModulo,
  estado: number,
  enabled: boolean,
) {
  const tipo = ADSE_TIPO_PRE_FATURA[modulo]
  return useQuery({
    queryKey: ['adse', 'pre-faturas', 'estado', modulo, estado],
    queryFn: () => AdseComunicacaoService(ADSE_PERM_ID).listarPreFaturasPorEstado(tipo, estado),
    enabled,
  })
}
