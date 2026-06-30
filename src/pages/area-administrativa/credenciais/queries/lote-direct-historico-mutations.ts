import { useMutation } from '@tanstack/react-query'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import type { PassarParaHistoricoRequest } from '@/types/dtos/credenciais/lote-direct.dtos'
import { useLoteDirectFuncionalidadeId } from './listagem-lote-direct-queries'

export const usePassarLoteDirectParaHistorico = () => {
  const permId = useLoteDirectFuncionalidadeId()
  return useMutation({
    mutationFn: (payload: PassarParaHistoricoRequest) =>
      LoteDirectService(permId).passarParaHistorico(payload),
  })
}
