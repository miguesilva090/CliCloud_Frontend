import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ModeloAparelhoLightDTO,
  ModeloAparelhoTableDTO,
} from '@/types/dtos/modelo-aparelho/modelo-aparelho.dtos'

const BASE = '/client/tratamentos/ModeloAparelho'

export class ModeloAparelhoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getModeloAparelhoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<ModeloAparelhoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ModeloAparelhoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getModeloAparelhoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ModeloAparelhoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<ModeloAparelhoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createModeloAparelho(
    body: { designacao: string; marcaAparelhoId: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateModeloAparelho(
    id: string,
    body: { designacao: string; marcaAparelhoId: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteModeloAparelho(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleModeloAparelho(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
