import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AparelhoLightDTO,
  AparelhoTableDTO,
} from '@/types/dtos/aparelho/aparelho.dtos'

const BASE = '/client/tratamentos/Aparelho'

export class AparelhoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAparelhoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<AparelhoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<AparelhoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getAparelhoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<AparelhoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<AparelhoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createAparelho(
    body: {
      tipoAparelhoId: string
      modeloAparelhoId?: string | null
      codigoSerie?: string | null
      codigoInventario?: string | null
      local?: string | null
      observacoes?: string | null
      ocupado: boolean
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateAparelho(
    id: string,
    body: {
      tipoAparelhoId: string
      modeloAparelhoId?: string | null
      codigoSerie?: string | null
      codigoInventario?: string | null
      local?: string | null
      observacoes?: string | null
      ocupado: boolean
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteAparelho(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleAparelho(
    body: { ids: string[] }
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      { ids: string[] },
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
