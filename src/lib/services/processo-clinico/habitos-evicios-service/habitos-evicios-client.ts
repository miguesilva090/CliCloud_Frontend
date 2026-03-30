import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  HabitosEViciosDTO,
  HabitosEViciosTableDTO,
  HabitosEViciosTableFilterRequest,
  CreateHabitosEViciosRequest,
  UpdateHabitosEViciosRequest,
} from '@/types/dtos/saude/habitos-e-vicios.dtos'

const BASE = '/client/processo-clinico/HabitosEVicios'

type Filters = HabitosEViciosTableFilterRequest['filters']

export class HabitosEViciosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getHabitosEViciosPaginated(
    params: PaginatedRequest & { filters?: Filters }
  ): Promise<ResponseApi<PaginatedResponse<HabitosEViciosTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: Filters },
      PaginatedResponse<HabitosEViciosTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<HabitosEViciosDTO>> {
    return this.httpClient.getRequest<HabitosEViciosDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateHabitosEViciosRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateHabitosEViciosRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateHabitosEViciosRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateHabitosEViciosRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}