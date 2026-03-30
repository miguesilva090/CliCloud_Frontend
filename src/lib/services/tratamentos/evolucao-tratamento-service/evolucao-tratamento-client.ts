import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest, AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  EvolucaoTratamentoTableDTO,
  EvolucaoTratamentoDTO,
  EvolucaoTratamentoReportDTO,
  CreateEvolucaoTratamentoRequest,
  UpdateEvolucaoTratamentoRequest,
} from '@/types/dtos/tratamentos/evolucao-tratamento.dtos'

const BASE = '/client/tratamentos/EvolucaoTratamentos'

type PaginatedParams = Partial<TableFilterRequest>

export class EvolucaoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<EvolucaoTratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedParams, PaginatedResponse<EvolucaoTratamentoTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<EvolucaoTratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<EvolucaoTratamentoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  async getReportData(
    id: string
  ): Promise<ResponseApi<GSResponse<EvolucaoTratamentoReportDTO>>> {
    return this.httpClient.getRequest<GSResponse<EvolucaoTratamentoReportDTO>>(
      state.URL,
      `${BASE}/${id}/report`
    )
  }

  async getAll(
    body: AllFilterRequest
  ): Promise<ResponseApi<GSResponse<EvolucaoTratamentoTableDTO[]>>> {
    return this.httpClient.postRequest<AllFilterRequest, GSResponse<EvolucaoTratamentoTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async create(
    body: CreateEvolucaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateEvolucaoTratamentoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateEvolucaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateEvolucaoTratamentoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}