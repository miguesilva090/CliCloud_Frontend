import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    AtualizarValidacaoTransporteRequest,
    DocumentoDetalhesAdmissoesDTO,
    DocumentoAllFilter,
    DocumentoDTO,
    DocumentoLiquidacaoContextoDTO,
    DocumentoLightDTO,
    DocumentoPrintDTO,
    DocumentoTableDTO,
    DocumentoTableFilter,
    EnviarDocumentoEmailRequest,
} from '@/types/dtos/faturacao/documento.dtos'

const BASE = '/client/documentos/Documento'

export class DocumentoClient extends BaseApiClient {
    async getDocumentos(keyword = ''): Promise<ResponseApi<GSResponse<DocumentoDTO[]>>> {
        const url = keyword.trim()
            ? `${BASE}?keyword=${encodeURIComponent(keyword.trim())}`
            : BASE
        return this.httpClient.getRequest(state.URL, url)
    }

    async getDocumentosLight(
        keyword = '',
    ): Promise<ResponseApi<GSResponse<DocumentoLightDTO[]>>> {
        const url = keyword.trim()
            ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
            : `${BASE}/light`
        return this.httpClient.getRequest(state.URL, url)
    }

    async getDocumentosAll(
        payload: DocumentoAllFilter = {},
    ): Promise<ResponseApi<GSResponse<DocumentoTableDTO[]>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/all`, payload)
    }

    async getDocumentosPaginated(
        payload: DocumentoTableFilter,
    ): Promise<ResponseApi<PaginatedResponse<DocumentoTableDTO>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, payload)
    }

    async getDocumentoById(
        id: string
    ): Promise<ResponseApi<GSResponse<DocumentoDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
    }

    async getDocumentoPrint(
        id: string
    ): Promise<ResponseApi<GSResponse<DocumentoPrintDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}/print`)
    }

    async getDocumentoPrintOriginal(
        id: string
    ): Promise<ResponseApi<GSResponse<DocumentoPrintDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}/print/original`)
    }

    async enviarDocumentoPorEmail(
        id: string,
        payload: EnviarDocumentoEmailRequest,
    ): Promise<ResponseApi<GSResponse<boolean>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/${id}/email`, payload)
    }

    async getDocumentoLiquidacaoContexto(
        id: string
    ): Promise<ResponseApi<GSResponse<DocumentoLiquidacaoContextoDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}/liquidacao-contexto`)
    }

    async liquidarDocumento(
        id: string
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/${id}/liquidar`, {})
    }

    async atualizarValidacaoTransporte(
        id: string,
        payload: AtualizarValidacaoTransporteRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/${id}/validacao-transporte`,
            payload,
        )
    }

    async getDocumentoDetalhesAdmissoes(
        id: string
    ): Promise<ResponseApi<GSResponse<DocumentoDetalhesAdmissoesDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}/detalhes-admissoes`)
    }
}