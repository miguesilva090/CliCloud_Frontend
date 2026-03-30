import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  EstadoListaEsperaLightDTO,
  EstadoListaEsperaTableDTO,
} from '@/types/dtos/estados-lista-espera/estado-lista-espera.dtos'

const BASE = '/client/tratamentos/EstadoListaEspera'

export class EstadoListaEsperaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getEstadosListaEsperaLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<EstadoListaEsperaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<EstadoListaEsperaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getEstadosListaEsperaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<EstadoListaEsperaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<EstadoListaEsperaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getEstadoListaEsperaById(
    id: string
  ): Promise<ResponseApi<GSResponse<EstadoListaEsperaTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<EstadoListaEsperaTableDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createEstadoListaEspera(body: {
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateEstadoListaEspera(
    id: string,
    body: { Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteEstadoListaEspera(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleEstadosListaEspera(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
