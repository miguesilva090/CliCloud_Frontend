import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TensaoArterialDTO,
  TensaoArterialTableDTO,
  CreateTensaoArterialRequest,
  UpdateTensaoArterialRequest,
} from '@/types/dtos/sinais-vitais/tensao-arterial.dtos'

const BASE = '/client/processo-clinico/TensaoArterial'

type PaginatedParams = Partial<TableFilterRequest>

export class TensaoArterialClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<TensaoArterialTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<TensaoArterialTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<TensaoArterialDTO>> {
    return this.httpClient.getRequest<TensaoArterialDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateTensaoArterialRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateTensaoArterialRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateTensaoArterialRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateTensaoArterialRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

