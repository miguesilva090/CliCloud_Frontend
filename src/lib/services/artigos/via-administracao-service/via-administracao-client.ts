import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ViaAdministracaoDTO,
  ViaAdministracaoTableDTO,
  ViaAdministracaoTableFilterRequest,
  CreateViaAdministracaoRequest,
  UpdateViaAdministracaoRequest,
  DeleteMultipleViaAdministracaoRequest,
} from '@/types/dtos/artigos/via-administracao.dtos'

const BASE = '/client/artigos/ViaAdministracao'

export class ViaAdministracaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getViaAdministracaoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<ViaAdministracaoDTO[]>>> {
    const url = keyword
      ? `${BASE}?keyword=${encodeURIComponent(keyword)}`
      : BASE
    return this.httpClient.getRequest<GSResponse<ViaAdministracaoDTO[]>>(
      state.URL,
      url
    )
  }

  public async getViaAdministracaoPaginated(
    params: ViaAdministracaoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<ViaAdministracaoTableDTO>>> {
    return this.httpClient.postRequest<
      ViaAdministracaoTableFilterRequest,
      PaginatedResponse<ViaAdministracaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getViaAdministracao(
    id: string
  ): Promise<ResponseApi<GSResponse<ViaAdministracaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ViaAdministracaoDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createViaAdministracao(
    body: CreateViaAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateViaAdministracaoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  public async updateViaAdministracao(
    id: string,
    body: UpdateViaAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateViaAdministracaoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  public async deleteViaAdministracao(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async deleteMultipleViaAdministracao(
    body: DeleteMultipleViaAdministracaoRequest
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleViaAdministracaoRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}
