import { useMutation } from '@tanstack/react-query'
import { DocumentoEmissaoService } from '@/lib/services/faturacao/documento-emissao-service'
import type {
  FaturaGlobalObterRequest,
  SinistradosInfoFaturacaoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'

const ID = 'documentos'

export function useSinistradosInfoFaturacaoMutation() {
  return useMutation({
    mutationFn: (payload: SinistradosInfoFaturacaoRequest) =>
      DocumentoEmissaoService(ID).sinistradosInfoFaturacao(payload),
  })
}

export function useFaturaGlobalObterMutation() {
  return useMutation({
    mutationFn: (payload: FaturaGlobalObterRequest) =>
      DocumentoEmissaoService(ID).faturaGlobalObter(payload),
  })
}
