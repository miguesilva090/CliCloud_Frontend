import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AlergiaLightDTO,
  AlergiaTableDTO,
} from '@/types/dtos/alergias/alergia.dtos'

const BASE = '/client/alergias/Alergia'

export class AlergiaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAlergiasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<AlergiaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<AlergiaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getAlergiasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<AlergiaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<AlergiaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getAlergiaById(
    id: string
  ): Promise<ResponseApi<GSResponse<AlergiaTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<AlergiaTableDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createAlergia(body: {
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateAlergia(
    id: string,
    body: { Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteAlergia(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleAlergias(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
