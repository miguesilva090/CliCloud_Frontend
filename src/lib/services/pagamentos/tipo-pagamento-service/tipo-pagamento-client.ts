import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type { TipoPagamentoLightDTO } from '@/types/dtos/pagamentos/tipo-pagamento.dtos'

const BASE = '/client/pagamentos/TipoPagamento'

export class TipoPagamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getTiposPagamentoLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<TipoPagamentoLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<TipoPagamentoLightDTO[]>>(
      state.URL,
      url,
    )
  }
}
