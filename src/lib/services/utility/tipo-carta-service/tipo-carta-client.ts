import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoCartaCreateRequest,
  TipoCartaTableDTO,
  TipoCartaUpdateRequest,
} from '@/types/dtos/utility/tipo-carta.dtos'

const BASE = '/client/utility/TipoCarta'

export class TipoCartaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getTiposCartaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoCartaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoCartaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createTipoCarta(
    body: TipoCartaCreateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<TipoCartaCreateRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateTipoCarta(
    id: string,
    body: TipoCartaUpdateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<TipoCartaUpdateRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteTipoCarta(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
