import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MapaBodyChartDTO,
  MapaBodyChartLightDTO,
  MapaBodyChartTableDTO,
  MapaBodyChartTableFilterRequest,
  MapaBodyChartAllFilterRequest,
  CreateMapaBodyChartRequest,
  UpdateMapaBodyChartRequest,
  DeleteMultipleMapaBodyChartRequest,
} from '@/types/dtos/processo-clinico/body-chart.dtos'

const BASE = '/client/processo-clinico/MapaBodyChart'

type Filters = MapaBodyChartTableFilterRequest['filters']

export class MapaBodyChartClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getLight(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<MapaBodyChartLightDTO[]>>> {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<GSResponse<MapaBodyChartLightDTO[]>>(
      state.URL,
      `${BASE}/light${params}`,
    )
  }

  async getPaginated(
    params: PaginatedRequest & { filters?: Filters },
  ): Promise<ResponseApi<PaginatedResponse<MapaBodyChartTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: Filters },
      PaginatedResponse<MapaBodyChartTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getAll(
    body: MapaBodyChartAllFilterRequest,
  ): Promise<ResponseApi<GSResponse<MapaBodyChartTableDTO[]>>> {
    return this.httpClient.postRequest<
      MapaBodyChartAllFilterRequest,
      GSResponse<MapaBodyChartTableDTO[]>
    >(state.URL, `${BASE}/all`, body)
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<MapaBodyChartDTO>>> {
    return this.httpClient.getRequest<GSResponse<MapaBodyChartDTO>>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateMapaBodyChartRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateMapaBodyChartRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async update(
    id: string,
    body: UpdateMapaBodyChartRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateMapaBodyChartRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  async deleteMultiple(
    body: DeleteMultipleMapaBodyChartRequest,
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleMapaBodyChartRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}

