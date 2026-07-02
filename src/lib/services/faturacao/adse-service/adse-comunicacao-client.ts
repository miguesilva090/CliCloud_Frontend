import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AdseComunicacaoModulo,
  AdseComunicacaoPaginatedDTO,
  AdseComunicacaoTableFilter,
  AdseComunicarDocumentosRequest,
  AdseFecharPreFaturaRequest,
  AdsePreFaturaDTO,
  AdseUploadPdfRequest,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'

const BASE = '/client/faturacao/adse/comunicacao'

export class AdseComunicacaoClient extends BaseApiClient {
  getPaginated(
    modulo: AdseComunicacaoModulo,
    filter: AdseComunicacaoTableFilter,
  ): Promise<ResponseApi<GSResponse<AdseComunicacaoPaginatedDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${modulo}/paginated`, filter)
  }

  listarPreFaturasAbertas(
    tipoPreFatura: string,
  ): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO[]>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/pre-faturas/abertas?tipoPreFatura=${encodeURIComponent(tipoPreFatura)}`,
    )
  }

  listarPreFaturasPorEstado(
    tipoPreFatura: string,
    estado: number,
  ): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO[]>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/pre-faturas?tipoPreFatura=${encodeURIComponent(tipoPreFatura)}&estado=${estado}`,
    )
  }

  apagarPreFatura(id: string): Promise<ResponseApi<GSResponse<boolean>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/pre-faturas/${id}`)
  }

  criarPreFatura(
    tipoPreFatura: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/pre-faturas`, { tipoPreFatura })
  }

  consultarPreFatura(id: string): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/pre-faturas/${id}`)
  }

  conferirPreFatura(id: string): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/pre-faturas/${id}/conferir`, {})
  }

  fecharPreFatura(
    id: string,
    payload: AdseFecharPreFaturaRequest,
  ): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/pre-faturas/${id}/fechar`, payload)
  }

  comunicarDocumentos(
    payload: AdseComunicarDocumentosRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/documentos/comunicar`, payload)
  }

  libertarDocumentos(documentoIds: string[]): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/documentos/libertar`, { documentoIds })
  }

  uploadPdf(
    modulo: AdseComunicacaoModulo,
    payload: AdseUploadPdfRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${modulo}/pdf`, payload)
  }
}
