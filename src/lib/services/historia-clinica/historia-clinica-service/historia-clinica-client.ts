import state from '@/states/state'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  HistoriaClinicaDTO,
  HistoriaClinicaTableDTO,
  CreateHistoriaClinicaRequest,
  UpdateHistoriaClinicaRequest,
} from '@/types/dtos/saude/historia-clinica.dtos'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

const BASE = '/client/HistoriaClinica'

type PaginatedParams = Partial<TableFilterRequest>

export class HistoriaClinicaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getHistoriaClinicaPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<HistoriaClinicaTableDTO>>> {
    return this.httpClient.postRequest<PaginatedParams, PaginatedResponse<HistoriaClinicaTableDTO>>(
      state.URL,
      `${BASE}/table`,
      params
    )
  }

  async getById(id: string): Promise<ResponseApi<HistoriaClinicaDTO>> {
    return this.httpClient.getRequest<HistoriaClinicaDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(body: CreateHistoriaClinicaRequest): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateHistoriaClinicaRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateHistoriaClinicaRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateHistoriaClinicaRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}

