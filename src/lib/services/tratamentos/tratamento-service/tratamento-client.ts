import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest, AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TratamentoTableDTO,
  CreateTratamentoRequest,
  TratamentoDTO,
} from '@/types/dtos/tratamentos/tratamento.dtos'

const BASE = '/client/tratamentos/Tratamento'

type PaginatedParams = Partial<TableFilterRequest>

export class TratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<TratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedParams, PaginatedResponse<TratamentoTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  async getAll(
    body: AllFilterRequest
  ): Promise<ResponseApi<GSResponse<TratamentoTableDTO[]>>> {
    return this.httpClient.postRequest<AllFilterRequest, GSResponse<TratamentoTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async create(body: CreateTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateTratamentoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async setAlta(id: string, alta: boolean): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<{ id: string; alta: boolean }, GSResponse<string>>(
      state.URL,
      `${BASE}/alta`,
      { id, alta },
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<TratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<TratamentoDTO>>(state.URL, `${BASE}/${id}`)
  }
}

