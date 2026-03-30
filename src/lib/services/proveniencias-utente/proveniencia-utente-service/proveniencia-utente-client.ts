import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ProvenienciaUtenteLightDTO,
  ProvenienciaUtenteTableDTO,
} from '@/types/dtos/proveniencias-utente/proveniencia-utente.dtos'

const BASE = '/client/proveniencias-utentes/ProvenienciaUtente'

export class ProvenienciaUtenteClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getProvenienciasUtenteLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<ProvenienciaUtenteLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ProvenienciaUtenteLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getProvenienciasUtentePaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ProvenienciaUtenteTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<ProvenienciaUtenteTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createProvenienciaUtente(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateProvenienciaUtente(
    id: string,
    body: { Codigo: string; Descricao: string }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteProvenienciaUtente(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
