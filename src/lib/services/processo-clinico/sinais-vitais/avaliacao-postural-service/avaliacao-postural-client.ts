import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AvaliacaoPosturalDTO,
  AvaliacaoPosturalTableDTO,
  CreateAvaliacaoPosturalRequest,
  UpdateAvaliacaoPosturalRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-postural.dtos'

const BASE = '/client/processo-clinico/AvaliacaoPostural'

type PaginatedParams = Partial<TableFilterRequest>

export class AvaliacaoPosturalClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<AvaliacaoPosturalTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<AvaliacaoPosturalTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<AvaliacaoPosturalDTO>> {
    return this.httpClient.getRequest<AvaliacaoPosturalDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateAvaliacaoPosturalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateAvaliacaoPosturalRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateAvaliacaoPosturalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateAvaliacaoPosturalRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}
