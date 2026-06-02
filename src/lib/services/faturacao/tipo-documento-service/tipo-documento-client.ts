import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'

const BASE = '/client/documentos/TipoDocumento'

export class TipoDocumentoClient extends BaseApiClient {
    async getTiposDocumentoLight(
        keyword = '',
    ): Promise<ResponseApi<GSResponse<TipoDocumentoLightDTO[]>>> {
        const url = keyword.trim()
            ? `${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
            : `${BASE}/light`
        return this.httpClient.getRequest(state.URL, url)
    }
}