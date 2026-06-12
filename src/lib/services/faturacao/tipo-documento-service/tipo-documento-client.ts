import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  TipoDocumentoDTO,
  TipoDocumentoFormDTO,
  TipoDocumentoLightDTO,
  TipoDocumentoTableDTO,
} from '@/types/dtos/faturacao/tipo-documento.dtos'

const BASE = '/client/documentos/TipoDocumento'

export class TipoDocumentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getTiposDocumentoLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<TipoDocumentoLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest(state.URL, url)
  }

  async getTiposDocumentoPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<TipoDocumentoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<TipoDocumentoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getTipoDocumentoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<TipoDocumentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<TipoDocumentoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async createTipoDocumento(
    body: TipoDocumentoFormDTO,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<TipoDocumentoFormDTO, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateTipoDocumento(
    id: string,
    body: TipoDocumentoFormDTO,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<TipoDocumentoFormDTO, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async deleteTipoDocumento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
