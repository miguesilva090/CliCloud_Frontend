import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { TableFilterRequest, AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ServicoTratamentoTableDTO,
  CreateServicoTratamentoRequest,
} from '@/types/dtos/tratamentos/servico-tratamento.dtos'

const BASE = '/client/tratamentos/ServicoTratamento'

type PaginatedParams = Partial<TableFilterRequest>

export class ServicoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<ServicoTratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedParams, PaginatedResponse<ServicoTratamentoTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  async getAll(
    body: AllFilterRequest
  ): Promise<ResponseApi<GSResponse<ServicoTratamentoTableDTO[]>>> {
    return this.httpClient.postRequest<AllFilterRequest, GSResponse<ServicoTratamentoTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async create(body: CreateServicoTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateServicoTratamentoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

