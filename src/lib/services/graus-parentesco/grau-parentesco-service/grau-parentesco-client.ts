import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GrauParentescoLightDTO,
  GrauParentescoTableDTO,
} from '@/types/dtos/graus-parentesco/grau-parentesco.dtos'

const BASE = '/client/graus-parentesco/GrauParentesco'

export class GrauParentescoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getGrausParentescoLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<GrauParentescoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<GrauParentescoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getGrausParentescoPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<GrauParentescoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<GrauParentescoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createGrauParentesco(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateGrauParentesco(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteGrauParentesco(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
