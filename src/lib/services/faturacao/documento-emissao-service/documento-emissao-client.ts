import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    AnularDocumentoRequest,
    CriarNotaCreditoRequest,
    DocumentoEmissaoDTO,
    EmitirDocumentoDesdeAdmissaoRequest,
    EmitirDocumentoDesdeConsultaRequest,
    EmitirDocumentoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'

const BASE = '/client/documentos/DocumentoEmissao'

export class DocumentoEmissaoClient extends BaseApiClient {
    async emitirDocumento(
        payload: EmitirDocumentoRequest,
    ): Promise<ResponseApi<GSResponse<DocumentoEmissaoDTO>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/emitir`, payload)
    }

    async emitirDocumentoDesdeAdmissao(
        admissaoId: string,
        payload: EmitirDocumentoDesdeAdmissaoRequest,
    ): Promise<ResponseApi<GSResponse<DocumentoEmissaoDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/emitir/admissao/${admissaoId}`,
            payload
        )
    }

    async emitirDocumentoDesdeConsulta(
        consultaId: string,
        payload: EmitirDocumentoDesdeConsultaRequest,
    ): Promise<ResponseApi<GSResponse<DocumentoEmissaoDTO>>> {
        return this.httpClient.postRequest(
            state.URL, 
            `${BASE}/emitir/consulta/${consultaId}`,
            payload
        )
    }

    async anularDocumento(
        documentoId: string,
        payload: AnularDocumentoRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/anular/${documentoId}`,
            payload
        )
    }

        async criarNotaCredito(
            payload: CriarNotaCreditoRequest,
        ): Promise<ResponseApi<GSResponse<DocumentoEmissaoDTO>>> {
            return this.httpClient.postRequest(
                state.URL,
                `${BASE}/nota-credito`,
                payload
            )
        }
}