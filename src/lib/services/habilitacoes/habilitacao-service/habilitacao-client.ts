import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  HabilitacaoLightDTO,
  HabilitacaoTableDTO,
} from '@/types/dtos/habilitacoes/habilitacao.dtos'

const BASE = '/client/habilitacoes/Habilitacao'

export class HabilitacaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getHabilitacoesLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<HabilitacaoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<HabilitacaoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getHabilitacoesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<HabilitacaoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<HabilitacaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createHabilitacao(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateHabilitacao(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteHabilitacao(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
