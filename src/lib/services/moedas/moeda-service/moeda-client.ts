import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MoedaLightDTO,
  MoedaTableDTO,
} from '@/types/dtos/moedas/moeda.dtos'

const BASE = '/client/moedas/Moeda'

export type CreateMoedaBody = {
  Codigo: number
  Descricao: string
  Plural?: string
  Cambio: number
  Abreviatura?: string
  Centesimos?: string
  CentesimoPlural?: string
  Simbolo?: string
}

export type UpdateMoedaBody = CreateMoedaBody

export class MoedaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getMoedasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<MoedaLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<MoedaLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getMoedasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<MoedaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<MoedaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createMoeda(
    body: CreateMoedaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateMoeda(
    id: string,
    body: UpdateMoedaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteMoeda(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
