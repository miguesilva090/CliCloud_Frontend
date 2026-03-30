import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  EstadoCivilLightDTO,
  EstadoCivilTableDTO,
} from '@/types/dtos/estados-civis/estado-civil.dtos'

const BASE = '/client/estadoscivis/EstadoCivil'

export class EstadoCivilClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getEstadosCivisLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<EstadoCivilLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<EstadoCivilLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getEstadosCivisPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<EstadoCivilTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<EstadoCivilTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createEstadoCivil(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateEstadoCivil(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteEstadoCivil(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
