import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  CondicaoPagamentoDTO,
  CondicaoPagamentoLightDTO,
  CondicaoPagamentoSaveBody,
  CondicaoPagamentoTableDTO,
} from '@/types/dtos/pagamentos/condicao-pagamento.dtos'

const BASE = '/client/pagamentos/CondicaoPagamento'

export class CondicaoPagamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getCondicoesPagamentoPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<CondicaoPagamentoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<CondicaoPagamentoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getCondicoesPagamentoLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<CondicaoPagamentoLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<CondicaoPagamentoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async getCondicaoPagamentoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<CondicaoPagamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<CondicaoPagamentoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createCondicaoPagamento(
    body: CondicaoPagamentoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CondicaoPagamentoSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateCondicaoPagamento(
    id: string,
    body: CondicaoPagamentoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<CondicaoPagamentoSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteCondicaoPagamento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
