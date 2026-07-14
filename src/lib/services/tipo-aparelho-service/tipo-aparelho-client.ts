import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoAparelhoLightDTO,
  TipoAparelhoTableDTO,
} from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'

const BASE = '/client/tratamentos/TipoAparelho'

export class TipoAparelhoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getTipoAparelhoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<TipoAparelhoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<TipoAparelhoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getTipoAparelhoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoAparelhoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoAparelhoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createTipoAparelho(
    body: { designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateTipoAparelho(
    id: string,
    body: { designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteTipoAparelho(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleTipoAparelho(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
