import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ModoPagamentoDTO,
  ModoPagamentoLightDTO,
  ModoPagamentoPaginatedRequest,
  ModoPagamentoSaveBody,
  ModoPagamentoTableDTO,
} from '@/types/dtos/pagamentos/modo-pagamento.dtos'

const BASE = '/client/pagamentos/ModoPagamento'

export class ModoPagamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getModosPagamentoPaginated(
    params: ModoPagamentoPaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<ModoPagamentoTableDTO>>> {
    return this.httpClient.postRequest<
      ModoPagamentoPaginatedRequest,
      PaginatedResponse<ModoPagamentoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getModosPagamentoLight(
    keyword = '',
    apenasAtivos = false,
  ): Promise<ResponseApi<GSResponse<ModoPagamentoLightDTO[]>>> {
    const query = new URLSearchParams()
    if (keyword.trim()) query.set('keyword', keyword.trim())
    if (apenasAtivos) query.set('apenasAtivos', 'true')
    const qs = query.toString()
    const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ModoPagamentoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async getModoPagamentoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<ModoPagamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ModoPagamentoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createModoPagamento(
    body: ModoPagamentoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<ModoPagamentoSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateModoPagamento(
    id: string,
    body: ModoPagamentoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<ModoPagamentoSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteModoPagamento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async passarHistoricoModoPagamento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<Record<string, never>, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/historico/passar`,
      {},
    )
  }

  async retirarHistoricoModoPagamento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<Record<string, never>, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/historico/retirar`,
      {},
    )
  }
}
