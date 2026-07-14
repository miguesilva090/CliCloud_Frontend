import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TemperaturaCorporalDTO,
  TemperaturaCorporalTableDTO,
  CreateTemperaturaCorporalRequest,
  UpdateTemperaturaCorporalRequest,
} from '@/types/dtos/sinais-vitais/temperatura-corporal.dtos'

const BASE = '/client/processo-clinico/TemperaturaCorporal'

type PaginatedParams = Partial<TableFilterRequest>

export class TemperaturaCorporalClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<TemperaturaCorporalTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<TemperaturaCorporalTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<TemperaturaCorporalDTO>> {
    return this.httpClient.getRequest<TemperaturaCorporalDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateTemperaturaCorporalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateTemperaturaCorporalRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateTemperaturaCorporalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateTemperaturaCorporalRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

