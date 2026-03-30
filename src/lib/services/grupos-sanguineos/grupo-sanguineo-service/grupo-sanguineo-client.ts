import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GrupoSanguineoLightDTO,
  GrupoSanguineoTableDTO,
} from '@/types/dtos/grupos-sanguineos/grupo-sanguineo.dtos'

const BASE = '/client/grupossanguineos/GrupoSanguineo'

export class GrupoSanguineoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getGruposSanguineosLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<GrupoSanguineoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<GrupoSanguineoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getGruposSanguineosPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<GrupoSanguineoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<GrupoSanguineoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createGrupoSanguineo(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateGrupoSanguineo(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteGrupoSanguineo(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
