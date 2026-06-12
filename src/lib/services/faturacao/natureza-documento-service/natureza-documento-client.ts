import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  NaturezaDocumentoLightDTO,
  NaturezaDocumentoTableDTO,
} from '@/types/dtos/faturacao/natureza-documento.dtos'

const BASE = '/client/documentos/NaturezaDocumento'

export class NaturezaDocumentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getNaturezasDocumentoPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<NaturezaDocumentoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<NaturezaDocumentoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getNaturezasDocumentoLight(
    keyword = '',
  ): Promise<ResponseApi<GSResponse<NaturezaDocumentoLightDTO[]>>> {
    const url = keyword.trim()
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<NaturezaDocumentoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  async createNaturezaDocumento(body: {
    sigla: string
    descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      { sigla: string; descricao: string },
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async updateNaturezaDocumento(
    id: string,
    body: { sigla: string; descricao: string },
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      { sigla: string; descricao: string },
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async getNaturezaDocumentoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<NaturezaDocumentoTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<NaturezaDocumentoTableDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async deleteNaturezaDocumento(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
