import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ContaBancariaDTO,
  ContaBancariaFormDTO,
  ContaBancariaLightDTO,
  ContaBancariaTableDTO,
} from '@/types/dtos/bancos/conta-bancaria.dtos'

const BASE = '/client/bancos/ContaBancaria'

export class ContaBancariaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getContasBancariasLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<ContaBancariaLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest(state.URL, url)
  }

  async getContasBancariasPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<ContaBancariaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<ContaBancariaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getContaBancariaById(
    id: string,
  ): Promise<ResponseApi<GSResponse<ContaBancariaDTO>>> {
    return this.httpClient.getRequest<GSResponse<ContaBancariaDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createContaBancaria(
    body: ContaBancariaFormDTO,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<ContaBancariaFormDTO, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateContaBancaria(
    id: string,
    body: ContaBancariaFormDTO,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<ContaBancariaFormDTO, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteContaBancaria(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
