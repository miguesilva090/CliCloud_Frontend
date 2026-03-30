import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  PatologiaDTO,
  PatologiaLightDTO,
  PatologiaTableDTO,
  CreatePatologiaRequest,
  UpdatePatologiaRequest,
} from '@/types/dtos/patologias/patologia.dtos'

const BASE = '/client/tratamentos/Patologia'

export class PatologiaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPatologiasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<PatologiaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<PatologiaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getPatologiasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<PatologiaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<PatologiaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getPatologiaById(
    id: string
  ): Promise<ResponseApi<GSResponse<PatologiaDTO>>> {
    return this.httpClient.getRequest<GSResponse<PatologiaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createPatologia(
    body: CreatePatologiaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreatePatologiaRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updatePatologia(
    id: string,
    body: UpdatePatologiaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdatePatologiaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deletePatologia(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultiplePatologias(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
