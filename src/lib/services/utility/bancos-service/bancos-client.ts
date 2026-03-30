import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
  PaginatedRequest,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { BancoTableDTO } from '@/types/dtos/utility/banco.dtos'

const BASE = '/client/bancos/Banco'

export interface BancoLightItem {
  id: string
  nome?: string
}

export class BancosClient extends BaseApiClient {
  /**
   * GET /client/bancos/Banco/light
   */
  public async getBancosLight(
    keyword = ''
  ): Promise<ResponseApi<{ data?: BancoLightItem[] }>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<{ data?: BancoLightItem[] }>(
      state.URL,
      url
    )
  }

  /**
   * POST /client/bancos/Banco/paginated
   */
  public async getBancosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<BancoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<BancoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  /**
   * POST /client/bancos/Banco
   */
  public async createBanco(body: {
    Nome: string
    TipoEntidadeId: number
    Abreviatura?: string | null
    Email?: string | null
    NumeroContribuinte?: string | null
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}`,
      body
    )
  }

  /**
   * PUT /client/bancos/Banco/{id}
   */
  public async updateBanco(
    id: string,
    body: {
      Nome: string
      TipoEntidadeId: number
      Abreviatura?: string | null
      Email?: string | null
      NumeroContribuinte?: string | null
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  /**
   * DELETE /client/bancos/Banco/{id}
   */
  public async deleteBanco(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

