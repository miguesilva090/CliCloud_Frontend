import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  IndiceMassaCorporalDTO,
  IndiceMassaCorporalTableDTO,
  CreateIndiceMassaCorporalRequest,
  UpdateIndiceMassaCorporalRequest,
} from '@/types/dtos/sinais-vitais/indice-massa-corporal.dtos'

const BASE = '/client/processo-clinico/IndiceMassaCorporal'

type PaginatedParams = Partial<TableFilterRequest>

export class IndiceMassaCorporalClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<IndiceMassaCorporalTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<IndiceMassaCorporalTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<IndiceMassaCorporalDTO>> {
    return this.httpClient.getRequest<IndiceMassaCorporalDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateIndiceMassaCorporalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateIndiceMassaCorporalRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateIndiceMassaCorporalRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateIndiceMassaCorporalRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

