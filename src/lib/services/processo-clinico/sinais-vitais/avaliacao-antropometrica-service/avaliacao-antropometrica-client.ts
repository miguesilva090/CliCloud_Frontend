import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AvaliacaoAntropometricaDTO,
  AvaliacaoAntropometricaTableDTO,
  CreateAvaliacaoAntropometricaRequest,
  UpdateAvaliacaoAntropometricaRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-antropometrica.dtos'

const BASE = '/client/processo-clinico/AvaliacaoAntropometrica'

type PaginatedParams = Partial<TableFilterRequest>

export class AvaliacaoAntropometricaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: PaginatedParams
  ): Promise<ResponseApi<PaginatedResponse<AvaliacaoAntropometricaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedParams,
      PaginatedResponse<AvaliacaoAntropometricaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<AvaliacaoAntropometricaDTO>> {
    return this.httpClient.getRequest<AvaliacaoAntropometricaDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateAvaliacaoAntropometricaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateAvaliacaoAntropometricaRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateAvaliacaoAntropometricaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateAvaliacaoAntropometricaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}
