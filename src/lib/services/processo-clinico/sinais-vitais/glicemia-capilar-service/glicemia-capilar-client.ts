import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GlicemiaCapilarDTO,
  GlicemiaCapilarTableDTO,
  CreateGlicemiaCapilarRequest,
  UpdateGlicemiaCapilarRequest,
} from '@/types/dtos/sinais-vitais/glicemia-capilar.dtos'

const BASE = '/client/processo-clinico/GlicemiaCapilar'

type PaginatedParams = Partial<TableFilterRequest>

export class GlicemiaCapilarClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<GlicemiaCapilarTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<GlicemiaCapilarTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<GlicemiaCapilarDTO>> {
    return this.httpClient.getRequest<GlicemiaCapilarDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateGlicemiaCapilarRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateGlicemiaCapilarRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateGlicemiaCapilarRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateGlicemiaCapilarRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

