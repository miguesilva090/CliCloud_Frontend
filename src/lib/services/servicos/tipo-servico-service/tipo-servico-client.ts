import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TipoServicoDTO,
  TipoServicoLightDTO,
  TipoServicoTableDTO,
  TipoServicoTableFilterRequest,
  CreateTipoServicoRequest,
  UpdateTipoServicoRequest,
  DeleteMultipleTipoServicoRequest,
} from '@/types/dtos/servicos/tipo-servico.dtos'

const BASE = '/client/servicos/TipoServico'

export class TipoServicoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getTipoServicoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<TipoServicoLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<TipoServicoLightDTO[]>>(state.URL, url)
  }

  public async getTipoServicoPaginated(
    params: TipoServicoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<TipoServicoTableDTO>>> {
    return this.httpClient.postRequest<
      TipoServicoTableFilterRequest,
      PaginatedResponse<TipoServicoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getAllTiposServico(
    body: TipoServicoTableFilterRequest
  ): Promise<ResponseApi<GSResponse<TipoServicoTableDTO[]>>> {
    return this.httpClient.postRequest<TipoServicoTableFilterRequest, GSResponse<TipoServicoTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  public async getTipoServico(id: string): Promise<ResponseApi<GSResponse<TipoServicoDTO>>> {
    return this.httpClient.getRequest<GSResponse<TipoServicoDTO>>(state.URL, `${BASE}/${id}`)
  }

  public async createTipoServico(
    body: CreateTipoServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateTipoServicoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateTipoServico(
    id: string,
    body: UpdateTipoServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateTipoServicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteTipoServico(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  public async deleteMultipleTipoServico(
    body: DeleteMultipleTipoServicoRequest
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleTipoServicoRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}

