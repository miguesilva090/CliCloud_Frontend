import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ZonaComercialDTO,
  ZonaComercialLightDTO,
  ZonaComercialSaveBody,
  ZonaComercialTableDTO,
} from '@/types/dtos/faturacao/zona-comercial.dtos'

const BASE = '/client/faturacao/ZonaComercial'

export class ZonaComercialClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getZonasComerciaisPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<ZonaComercialTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<ZonaComercialTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getZonasComerciaisLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<ZonaComercialLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ZonaComercialLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async getZonaComercialById(
    id: string,
  ): Promise<ResponseApi<GSResponse<ZonaComercialDTO>>> {
    return this.httpClient.getRequest<GSResponse<ZonaComercialDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createZonaComercial(
    body: ZonaComercialSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<ZonaComercialSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateZonaComercial(
    id: string,
    body: ZonaComercialSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<ZonaComercialSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteZonaComercial(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
