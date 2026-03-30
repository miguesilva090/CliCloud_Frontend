import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ServicoDTO,
  ServicoLightDTO,
  ServicoTableDTO,
  ServicoTableFilterRequest,
  CreateServicoRequest,
  UpdateServicoRequest,
  DeleteMultipleServicoRequest,
} from '@/types/dtos/servicos/servico.dtos'

const BASE = '/client/servicos/Servico'

export class ServicoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getServicoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<ServicoLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ServicoLightDTO[]>>(state.URL, url)
  }

  public async getServicoPaginated(
    params: ServicoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<ServicoTableDTO>>> {
    return this.httpClient.postRequest<ServicoTableFilterRequest, PaginatedResponse<ServicoTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  public async getAllServicos(
    body: ServicoTableFilterRequest
  ): Promise<ResponseApi<GSResponse<ServicoTableDTO[]>>> {
    return this.httpClient.postRequest<ServicoTableFilterRequest, GSResponse<ServicoTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  public async getServico(id: string): Promise<ResponseApi<GSResponse<ServicoDTO>>> {
    return this.httpClient.getRequest<GSResponse<ServicoDTO>>(state.URL, `${BASE}/${id}`)
  }

  public async createServico(
    body: CreateServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateServicoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateServico(
    id: string,
    body: UpdateServicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateServicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteServico(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  public async deleteMultipleServico(
    body: DeleteMultipleServicoRequest
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteMultipleServicoRequest,
      GSResponse<string[]>
    >(state.URL, `${BASE}/bulk`, body)
  }
}

