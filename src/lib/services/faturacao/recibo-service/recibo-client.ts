import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    ReciboAllFilter,
    ReciboDTO,
    ReciboLightDTO,
    ReciboTableDTO,
    ReciboTableFilter,
} from '@/types/dtos/faturacao/recibo.dtos'

const BASE = '/client/documentos/Recibo'

export class ReciboClient extends BaseApiClient {
    async getRecibos(keyword = ''): Promise<ResponseApi<GSResponse<ReciboDTO[]>>> {
        const url = keyword.trim()
            ?`${BASE}?keyword=${encodeURIComponent(keyword.trim())}`
            : `${BASE}`
        return this.httpClient.getRequest(state.URL, url)
    }

    async getRecibosLight(keyword = ''): Promise<ResponseApi<GSResponse<ReciboLightDTO[]>>> {
        const url = keyword.trim()
            ?`${BASE}/light?keyword=${encodeURIComponent(keyword.trim())}`
            : `${BASE}/light`
        return this.httpClient.getRequest(state.URL, url)
    }

    async getRecibosAll(
        payload: ReciboAllFilter = {},
    ): Promise<ResponseApi<GSResponse<ReciboTableDTO[]>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/all`, payload)
    }

    async getRecibosPaginated(
        payload: ReciboTableFilter,
    ): Promise<ResponseApi<PaginatedResponse<ReciboTableDTO>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, payload)
    }

    async getReciboById(
        id: string
    ): Promise<ResponseApi<GSResponse<ReciboDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
    }
    
}