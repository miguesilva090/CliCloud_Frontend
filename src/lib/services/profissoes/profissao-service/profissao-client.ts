import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ProfissaoLightDTO,
  ProfissaoTableDTO,
} from '@/types/dtos/profissoes/profissao.dtos'

const BASE = '/client/profissoes/Profissao'

export class ProfissaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getProfissoesLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<ProfissaoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ProfissaoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getProfissoesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ProfissaoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<ProfissaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createProfissao(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateProfissao(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteProfissao(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
