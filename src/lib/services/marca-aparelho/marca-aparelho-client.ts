import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MarcaAparelhoLightDTO,
  MarcaAparelhoTableDTO,
} from '@/types/dtos/marca-aparelho/marca-aparelho.dtos'

const BASE = '/client/tratamentos/MarcaAparelho'

export class MarcaAparelhoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getMarcaAparelhoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<MarcaAparelhoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<MarcaAparelhoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getMarcaAparelhoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<MarcaAparelhoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<MarcaAparelhoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createMarcaAparelho(
    body: { designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateMarcaAparelho(
    id: string,
    body: { designacao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteMarcaAparelho(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleMarcaAparelho(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
