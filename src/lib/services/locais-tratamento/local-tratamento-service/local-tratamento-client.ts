import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  LocalTratamentoLightDTO,
  LocalTratamentoTableDTO,
} from '@/types/dtos/locais-tratamento/local-tratamento.dtos'

const BASE = '/client/tratamentos/LocalTratamento'

export class LocalTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getLocaisTratamentoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<LocalTratamentoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<LocalTratamentoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getLocaisTratamentoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<LocalTratamentoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<LocalTratamentoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createLocalTratamento(body: {
    Designacao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateLocalTratamento(
    id: string,
    body: { Designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteLocalTratamento(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleLocaisTratamento(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, { ids })
  }
}
