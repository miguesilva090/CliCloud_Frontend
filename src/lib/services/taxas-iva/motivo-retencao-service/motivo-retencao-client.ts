import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MotivoRetencaoDTO,
  MotivoRetencaoLightDTO,
  MotivoRetencaoSaveBody,
  MotivoRetencaoTableDTO,
} from '@/types/dtos/taxas-iva/motivo-retencao.dtos'

const BASE = '/client/taxas-iva/MotivoRetencao'

export class MotivoRetencaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getMotivosRetencaoPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<MotivoRetencaoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<MotivoRetencaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getMotivosRetencaoLight(
    keyword = '',
    tipoImposto = '',
  ): Promise<ResponseApi<GSResponse<MotivoRetencaoLightDTO[]>>> {
    const query = new URLSearchParams()
    if (keyword) query.set('keyword', keyword)
    if (tipoImposto) query.set('tipoImposto', tipoImposto)
    const qs = query.toString()
    const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<MotivoRetencaoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async createMotivoRetencao(
    body: MotivoRetencaoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<MotivoRetencaoSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateMotivoRetencao(
    id: string,
    body: MotivoRetencaoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<MotivoRetencaoSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async getMotivoRetencaoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<MotivoRetencaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<MotivoRetencaoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async deleteMotivoRetencao(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
