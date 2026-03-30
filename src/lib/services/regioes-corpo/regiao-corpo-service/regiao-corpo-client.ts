import state from '@/states/state'
import type {
    GSResponse, 
    PaginatedRequest, 
    PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    RegiaoCorpoLightDTO,
    RegiaoCorpoTableDTO,
    RegiaoCorpoDTO,
    CreateRegiaoCorpoRequest,
    UpdateRegiaoCorpoRequest,
} from '@/types/dtos/regioes-corpo/regiao-corpo.dtos'

const BASE = '/client/regioes-corpo/RegiaoCorpo'

export class RegiaoCorpoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  // full list
  public async getRegioesCorpo(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<RegiaoCorpoDTO[]>>> {
    const url = keyword
      ? `${BASE}?keyword=${encodeURIComponent(keyword)}`
      : BASE

    return this.httpClient.getRequest<GSResponse<RegiaoCorpoDTO[]>>(
      state.URL,
      url
    )
  }

  // lightweight list
  public async getRegioesCorpoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<RegiaoCorpoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`

    return this.httpClient.getRequest<GSResponse<RegiaoCorpoLightDTO[]>>(
      state.URL,
      url
    )
  }

  // paginated list (table DTO)
  public async getRegioesCorpoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<RegiaoCorpoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<RegiaoCorpoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  // all (non-paginated table DTO)
  public async getAllRegioesCorpo(
    body: unknown
  ): Promise<ResponseApi<GSResponse<RegiaoCorpoTableDTO[]>>> {
    return this.httpClient.postRequest<
      typeof body,
      GSResponse<RegiaoCorpoTableDTO[]>
    >(state.URL, `${BASE}/all`, body)
  }

  // single by Id
  public async getRegiaoCorpo(
    id: string
  ): Promise<ResponseApi<GSResponse<RegiaoCorpoDTO>>> {
    return this.httpClient.getRequest<GSResponse<RegiaoCorpoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  // single by Descricao
  public async getRegiaoCorpoByDescricao(
    descricao: string
  ): Promise<ResponseApi<GSResponse<RegiaoCorpoDTO>>> {
    return this.httpClient.getRequest<GSResponse<RegiaoCorpoDTO>>(
      state.URL,
      `${BASE}/descricao/${encodeURIComponent(descricao)}`
    )
  }

  public async createRegiaoCorpo(
    body: CreateRegiaoCorpoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateRegiaoCorpoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  public async updateRegiaoCorpo(
    id: string,
    body: UpdateRegiaoCorpoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateRegiaoCorpoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  public async deleteRegiaoCorpo(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleRegioesCorpo(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      typeof body,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}