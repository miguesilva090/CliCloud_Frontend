import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdseComunicacaoService } from '@/lib/services/faturacao/adse-service'
import type {
  AdseComunicacaoModulo,
  AdseComunicarDocumentosRequest,
  AdseFecharPreFaturaRequest,
  AdseUploadPdfRequest,
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

export function useLibertarAdseDocumentosMutation() {
  return useMutation({
    mutationFn: (documentoIds: string[]) =>
      AdseComunicacaoService(ADSE_PERM_ID).libertarDocumentos(documentoIds),
  })
}

export function useConferirAdsePreFaturaMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdseComunicacaoService(ADSE_PERM_ID).conferirPreFatura(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adse', 'pre-faturas'] })
    },
  })
}

export function useConsultarAdsePreFaturaMutation() {
  return useMutation({
    mutationFn: (id: string) => AdseComunicacaoService(ADSE_PERM_ID).consultarPreFatura(id),
  })
}

export function useFecharAdsePreFaturaMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdseFecharPreFaturaRequest }) =>
      AdseComunicacaoService(ADSE_PERM_ID).fecharPreFatura(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adse', 'pre-faturas'] })
    },
  })
}

export function useUploadAdsePdfMutation(modulo: AdseComunicacaoModulo) {
  return useMutation({
    mutationFn: (payload: AdseUploadPdfRequest) =>
      AdseComunicacaoService(ADSE_PERM_ID).uploadPdf(modulo, payload),
  })
}
