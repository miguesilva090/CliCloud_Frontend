import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    TipoExameDTO,
    TipoExameLightDTO,
    TipoExameTableDTO,
    CreateTipoExameRequest,
    UpdateTipoExameRequest,
} from '@/types/dtos/exames/tipo-exame'

const BASE = '/client/exames/TipoExame'

export class TipoExameClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getTipoExames(keyword = ''): Promise<ResponseApi<GSResponse<TipoExameDTO[]>>> {
        const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : `${BASE}`
        return this.httpClient.getRequest<GSResponse<TipoExameDTO[]>>(state.URL, url)
    }

    async getTipoExamesLight(keyword = ''): Promise<ResponseApi<GSResponse<TipoExameLightDTO[]>>> {
        const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<TipoExameLightDTO[]>>(state.URL, url)
    }

    async getTipoExamesPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<TipoExameTableDTO>>> {
        return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<TipoExameTableDTO>>(
            state.URL,
            `${BASE}/paginated`,
            params
        )
    }

    async getAllTipoExames( body : { filters?: Array<{id: string, value: string}>; sorting?: Array<{id: string, desc: boolean}> }): Promise<ResponseApi<GSResponse<TipoExameTableDTO[]>>> {
        return this.httpClient.postRequest<typeof body, GSResponse<TipoExameTableDTO[]>>(
            state.URL,
            `${BASE}/all`,
            body
        )
    }

    async getTipoExameById(id: string): Promise<ResponseApi<GSResponse<TipoExameDTO>>> {
        return this.httpClient.getRequest<GSResponse<TipoExameDTO>>(state.URL, `${BASE}/${id}`)
    }

    async createTipoExame(body: CreateTipoExameRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<CreateTipoExameRequest, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    async updateTipoExame(id: string, body: UpdateTipoExameRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<UpdateTipoExameRequest, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    async deleteTipoExame(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>> (
            state.URL,
            `${BASE}/${id}`
        )
    }

    async deleteMultipleTipoExames(ids: string[]): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.deleteRequestWithBody<{ ids: string[] }, GSResponse<string[]>>(
            state.URL,
            `${BASE}/bulk`,
            { ids }
        )
    }
}