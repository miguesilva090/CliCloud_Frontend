import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AcordosDTO,
  AcordosLightDTO,
  AcordosTableDTO,
  CreateAcordosRequest,
  UpdateAcordosRequest,
} from '@/types/dtos/exames/acordos'

const BASE = '/client/exames/Acordos'

export class AcordosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAcordos(keyword = ''): Promise<ResponseApi<GSResponse<AcordosDTO[]>>> {
    const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : BASE
    return this.httpClient.getRequest<GSResponse<AcordosDTO[]>>(state.URL, url)
  }

  async getAcordosLight(keyword = ''): Promise<ResponseApi<GSResponse<AcordosLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<AcordosLightDTO[]>>(state.URL, url)
  }

  async getAcordosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<AcordosTableDTO>>> {
    return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<AcordosTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  async getAllAcordos(body: {
    filters?: Array<{ id: string; value: string }>
    sorting?: Array<{ id: string; desc: boolean }>
  }): Promise<ResponseApi<GSResponse<AcordosTableDTO[]>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<AcordosTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async getAcordosById(id: string): Promise<ResponseApi<GSResponse<AcordosDTO>>> {
    return this.httpClient.getRequest<GSResponse<AcordosDTO>>(state.URL, `${BASE}/${id}`)
  }

  async createAcordos(body: CreateAcordosRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateAcordosRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async updateAcordos(
    id: string,
    body: UpdateAcordosRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateAcordosRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async deleteAcordos(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  async deleteMultipleAcordos(ids: string[]): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<{ ids: string[] }, GSResponse<string[]>>(
      state.URL,
      `${BASE}/bulk`,
      { ids }
    )
  }
}
