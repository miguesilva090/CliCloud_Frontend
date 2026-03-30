import state from '@/states/state'
import type {
  GSResponse,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoEntidadeFinanceiraDTO,
  TipoEntidadeFinanceiraLightDTO,
  TipoEntidadeFinanceiraTableDTO,
  CreateTipoEntidadeFinanceiraDTO,
  UpdateTipoEntidadeFinanceiraDTO,
} from '@/types/dtos/utility/tipo-entidade-financeira.dtos'
import type { PaginatedRequest } from '@/types/api/responses'

const BASE = '/client/tipoEntidadeFinanceira/TipoEntidadeFinanceira'

export class TipoEntidadeFinanceiraClient extends BaseApiClient {
  /**
   * GET /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira/light?keyword=
   */
  public async getTiposEntidadeLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<TipoEntidadeFinanceiraLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<
      GSResponse<TipoEntidadeFinanceiraLightDTO[]>
    >(state.URL, url)
  }

  /**
   * POST /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira/paginated
   */
  public async getTiposEntidadePaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoEntidadeFinanceiraTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoEntidadeFinanceiraTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  /**
   * GET /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira/{id}
   */
  public async getTipoEntidade(
    id: string
  ): Promise<ResponseApi<GSResponse<TipoEntidadeFinanceiraDTO>>> {
    const url = `${BASE}/${id}`
    return this.httpClient.getRequest<
      GSResponse<TipoEntidadeFinanceiraDTO>
    >(state.URL, url)
  }

  /**
   * POST /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira
   */
  public async createTipoEntidade(
    payload: CreateTipoEntidadeFinanceiraDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateTipoEntidadeFinanceiraDTO,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  /**
   * PUT /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira/{id}
   */
  public async updateTipoEntidade(
    id: string,
    payload: UpdateTipoEntidadeFinanceiraDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateTipoEntidadeFinanceiraDTO,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  /**
   * DELETE /client/tipoEntidadeFinanceira/TipoEntidadeFinanceira/{id}
   */
  public async deleteTipoEntidade(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

