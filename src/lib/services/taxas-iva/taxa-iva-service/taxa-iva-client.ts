import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TaxaIvaLightDTO,
  TaxaIvaTableDTO,
} from '@/types/dtos/taxas-iva/taxa-iva.dtos'

const BASE = '/client/taxas-iva/TaxaIva'

export class TaxaIvaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getTaxasIvaLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<TaxaIvaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<TaxaIvaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getTaxasIvaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<TaxaIvaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TaxaIvaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createTaxaIva(body: {
    Codigo: string
    Descricao: string
    Taxa: number
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateTaxaIva(
    id: string,
    body: { Codigo: string; Descricao: string; Taxa: number }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteTaxaIva(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
