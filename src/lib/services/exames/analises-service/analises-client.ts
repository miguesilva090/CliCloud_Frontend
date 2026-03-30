import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    AnaliseDTO, 
    AnaliseLightDTO, 
    AnaliseTableDTO, 
    CreateAnaliseRequest, 
    UpdateAnaliseRequest,
} from '@/types/dtos/exames/analises'

const BASE = '/client/exames/Analises'

export class AnalisesClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }


    async getAnalises(keyword = ''): Promise<ResponseApi<GSResponse<AnaliseDTO[]>>> {
        const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : `${BASE}`
        return this.httpClient.getRequest<GSResponse<AnaliseDTO[]>>(state.URL, url)
    }

    async getAnalisesLight(keyword = ''): Promise<ResponseApi<GSResponse<AnaliseLightDTO[]>>> {
        const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<AnaliseLightDTO[]>>(state.URL, url)
    }

    async getAnalisesPaginated( 
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<AnaliseTableDTO>>> {
        return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<AnaliseTableDTO>>(
            state.URL, 
            `${BASE}/paginated`, 
            params
        )
    }

    async getAnaliseById(id: string): Promise<ResponseApi<GSResponse<AnaliseDTO>>> {
        return this.httpClient.getRequest<GSResponse<AnaliseDTO>>(state.URL, `${BASE}/${id}`)
    }

    async createAnalise(body: CreateAnaliseRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<CreateAnaliseRequest, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    async updateAnalise(id: string, body: UpdateAnaliseRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<UpdateAnaliseRequest, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    async deleteAnalise(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>> (
            state.URL,
            `${BASE}/${id}`
        )
    }

    async deleteMultipleAnalises(ids: string[]): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.deleteRequestWithBody<{ ids: string[] }, GSResponse<string[]>>(
            state.URL,
            `${BASE}/bulk`,
            { ids }
        )
    }
}