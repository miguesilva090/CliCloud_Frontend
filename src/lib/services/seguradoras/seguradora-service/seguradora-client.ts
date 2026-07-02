import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    CreateSeguradoraPayload,
    SeguradoraDTO,
    SeguradoraLightDTO,
    SeguradoraTableDTO,
    SeguradoraTableFilterRequest,
    UpdateSeguradoraPayload,
} from '@/types/dtos/seguradoras/seguradora.dtos'

const BASE = '/client/seguradoras/Seguradora'

export class SeguradoraClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    getSeguradorasLight(keyword = '') {
        const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<SeguradoraLightDTO[]>>(state.URL, url)
    }

    getSeguradorasPaginated(params: SeguradoraTableFilterRequest) {
        return this.httpClient.postRequest<SeguradoraTableFilterRequest, PaginatedResponse<SeguradoraTableDTO>>(
            state.URL,
            `${BASE}/paginated`,
            params,
        )
    }

    getSeguradora(id: string) {
        return this.httpClient.getRequest<GSResponse<SeguradoraDTO>>(state.URL, `${BASE}/${id}`)
    }

    createSeguradora(body: CreateSeguradoraPayload) {
        return this.httpClient.postRequest<CreateSeguradoraPayload, GSResponse<string>>(state.URL, `${BASE}`, body)
    }

    updateSeguradora(id: string, body: UpdateSeguradoraPayload) {
        return this.httpClient.putRequest<UpdateSeguradoraPayload, GSResponse<string>>(state.URL, `${BASE}/${id}`, body)
    }

    deleteSeguradora(id: string) {
        return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
    }

}