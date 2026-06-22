import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ArtigoDTO,
  ArtigoLightDTO,
  ArtigoPaginatedRequest,
  ArtigoSaveBody,
  ArtigoTableDTO,
} from '@/types/dtos/stocks/artigo.dtos'

const BASE = '/client/stocks/Artigo'

export class ArtigoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getArtigosPaginated(
    params: ArtigoPaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<ArtigoTableDTO>>> {
    return this.httpClient.postRequest<
      ArtigoPaginatedRequest,
      PaginatedResponse<ArtigoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getArtigosLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<ArtigoLightDTO[]>>> {
    const query = new URLSearchParams()
    if (keyword.trim()) query.set('keyword', keyword.trim())
    const qs = query.toString()
    const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ArtigoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async getArtigoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<ArtigoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ArtigoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createArtigo(
    body: ArtigoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<ArtigoSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateArtigo(
    id: string,
    body: ArtigoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<ArtigoSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteArtigo(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
