import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdseComunicacaoService } from '@/lib/services/faturacao/adse-service'
import type {
  AdseComunicacaoModulo,
  AdseComunicarDocumentosRequest,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import { ADSE_PERM_ID } from './adse-config-queries'
import { ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'

export function useCriarAdsePreFaturaMutation(modulo: AdseComunicacaoModulo) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      AdseComunicacaoService(ADSE_PERM_ID).criarPreFatura(ADSE_TIPO_PRE_FATURA[modulo]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adse', 'pre-faturas'] })
    },
  })
}

export function useApagarAdsePreFaturaMutation(modulo: AdseComunicacaoModulo) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdseComunicacaoService(ADSE_PERM_ID).apagarPreFatura(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adse', 'pre-faturas'] })
    },
  })
}

export function useComunicarAdseDocumentosMutation() {
  return useMutation({
    mutationFn: (payload: AdseComunicarDocumentosRequest) =>
      AdseComunicacaoService(ADSE_PERM_ID).comunicarDocumentos(payload),
  })
}
