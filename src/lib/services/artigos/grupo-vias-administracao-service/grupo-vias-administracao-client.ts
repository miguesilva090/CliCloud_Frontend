import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GrupoViasAdministracaoDTO,
  GrupoViasAdministracaoTableDTO,
  GrupoViasAdministracaoTableFilterRequest,
  CreateGrupoViasAdministracaoRequest,
  UpdateGrupoViasAdministracaoRequest,
  DeleteMultipleGrupoViasAdministracaoRequest,
} from '@/types/dtos/artigos/grupo-vias-administracao.dtos'

const BASE = '/client/artigos/GrupoViasAdministracao'

export class GrupoViasAdministracaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getGrupoViasAdministracaoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<GrupoViasAdministracaoDTO[]>>> {
    const url = keyword
      ? `${BASE}?keyword=${encodeURIComponent(keyword)}`
      : BASE
    return this.httpClient.getRequest<GSResponse<GrupoViasAdministracaoDTO[]>>(
      state.URL,
      url
    )
  }

  public async getGrupoViasAdministracaoPaginated(
    params: GrupoViasAdministracaoTableFilterRequest
  ): Promise<
    ResponseApi<PaginatedResponse<GrupoViasAdministracaoTableDTO>>
  > {
    return this.httpClient.postRequest<
      GrupoViasAdministracaoTableFilterRequest,
      PaginatedResponse<GrupoViasAdministracaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getGrupoViasAdministracao(
    id: string
  ): Promise<ResponseApi<GSResponse<GrupoViasAdministracaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<GrupoViasAdministracaoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createGrupoViasAdministracao(
    body: CreateGrupoViasAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateGrupoViasAdministracaoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  public async updateGrupoViasAdministracao(
    id: string,
    body: UpdateGrupoViasAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateGrupoViasAdministracaoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  public async deleteGrupoViasAdministracao(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleGrupoViasAdministracao(
    body: DeleteMultipleGrupoViasAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleGrupoViasAdministracaoRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
