import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  SexoLightDTO,
  SexoTableDTO,
} from '@/types/dtos/sexos/sexo.dtos'

const BASE = '/client/sexos/Sexo'

export class SexoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getSexosLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<SexoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<SexoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getSexosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<SexoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<SexoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createSexo(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateSexo(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteSexo(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
