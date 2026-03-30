import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GrauAlergiaLightDTO,
  GrauAlergiaTableDTO,
} from '@/types/dtos/graus-alergia/grau-alergia.dtos'

const BASE = '/client/alergias/GrauAlergia'

export class GrauAlergiaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getGrausAlergiaLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<GrauAlergiaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<GrauAlergiaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getGrausAlergiaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<GrauAlergiaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<GrauAlergiaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createGrauAlergia(body: {
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateGrauAlergia(
    id: string,
    body: { Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteGrauAlergia(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleGrausAlergia(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
