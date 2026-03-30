import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  PrioridadeLightDTO,
  PrioridadeTableDTO,
} from '@/types/dtos/prioridades/prioridade.dtos'

const BASE = '/client/tratamentos/Prioridade'

export class PrioridadeClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPrioridadesLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<PrioridadeLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<PrioridadeLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getPrioridadesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<PrioridadeTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<PrioridadeTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getPrioridadeById(
    id: string
  ): Promise<ResponseApi<GSResponse<PrioridadeTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<PrioridadeTableDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createPrioridade(body: {
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updatePrioridade(
    id: string,
    body: { Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deletePrioridade(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultiplePrioridades(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
