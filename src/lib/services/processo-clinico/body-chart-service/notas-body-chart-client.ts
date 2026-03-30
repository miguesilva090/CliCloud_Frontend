import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  NotasBodyChartDTO,
  NotasBodyChartLightDTO,
  NotasBodyChartTableDTO,
  NotasBodyChartTableFilterRequest,
  NotasBodyChartAllFilterRequest,
  CreateNotasBodyChartRequest,
  UpdateNotasBodyChartRequest,
  DeleteMultipleNotasBodyChartRequest,
} from '@/types/dtos/processo-clinico/body-chart.dtos'

const BASE = '/client/processo-clinico/NotasBodyChart'

type Filters = NotasBodyChartTableFilterRequest['filters']

export class NotasBodyChartClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getLight(keyword?: string): Promise<ResponseApi<NotasBodyChartLightDTO[]>> {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<NotasBodyChartLightDTO[]>(state.URL, `${BASE}/light${params}`)
  }

  async getPaginated(
    params: PaginatedRequest & { filters?: Filters }
  ): Promise<ResponseApi<PaginatedResponse<NotasBodyChartTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: Filters },
      PaginatedResponse<NotasBodyChartTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getAll(
    body: NotasBodyChartAllFilterRequest
  ): Promise<ResponseApi<NotasBodyChartTableDTO[]>> {
    return this.httpClient.postRequest<NotasBodyChartAllFilterRequest, NotasBodyChartTableDTO[]>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async getById(id: string): Promise<ResponseApi<NotasBodyChartDTO>> {
    return this.httpClient.getRequest<NotasBodyChartDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateNotasBodyChartRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateNotasBodyChartRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateNotasBodyChartRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateNotasBodyChartRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }

  async deleteMultiple(
    body: DeleteMultipleNotasBodyChartRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleNotasBodyChartRequest,
      { data?: string }
    >(state.URL, `${BASE}/bulk`, body)
  }
}

