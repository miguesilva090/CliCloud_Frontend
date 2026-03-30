import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    CategoriaProcedimentoDTO,
    CategoriaProcedimentoLightDTO,
    CategoriaProcedimentoTableDTO,
    CreateCategoriaProcedimentoRequest,
    UpdateCategoriaProcedimentoRequest,
} from '@/types/dtos/exames/categoria-procedimento'

const BASE = '/client/exames/CategoriaProcedimento'

export class CategoriaProcedimentoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }


    async getCategoriaProcedimentos(keyword = ''): Promise<ResponseApi<GSResponse<CategoriaProcedimentoDTO[]>>> {
        const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : `${BASE}`
        return this.httpClient.getRequest<GSResponse<CategoriaProcedimentoDTO[]>>(state.URL, url)
    }

    async getCategoriaProcedimentosLight(keyword = ''): Promise<ResponseApi<GSResponse<CategoriaProcedimentoLightDTO[]>>> {
        const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<CategoriaProcedimentoLightDTO[]>>(state.URL, url)
    }

    async getCategoriaProcedimentosPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<CategoriaProcedimentoTableDTO>>> {
        return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<CategoriaProcedimentoTableDTO>>(
            state.URL,
            `${BASE}/paginated`,
            params
        )
    }

    async getAllCategoriaProcedimentos( body : { filters?: Array<{id: string, value: string}>; sorting?: Array<{id: string, desc: boolean}> }): Promise<ResponseApi<GSResponse<CategoriaProcedimentoTableDTO[]>>> {
        return this.httpClient.postRequest<typeof body, GSResponse<CategoriaProcedimentoTableDTO[]>>(
            state.URL,
            `${BASE}/all`,
            body
        )
    }

    async getCategoriaProcedimentoById(id: string): Promise<ResponseApi<GSResponse<CategoriaProcedimentoDTO>>> {
        return this.httpClient.getRequest<GSResponse<CategoriaProcedimentoDTO>>(state.URL, `${BASE}/${id}`)
    }

    async createCategoriaProcedimento(body: CreateCategoriaProcedimentoRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<CreateCategoriaProcedimentoRequest, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    async updateCategoriaProcedimento(id: string, body: UpdateCategoriaProcedimentoRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<UpdateCategoriaProcedimentoRequest, GSResponse<string>> (
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    async deleteCategoriaProcedimento(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>> (
            state.URL,
            `${BASE}/${id}`
        )
    }

    async deleteMultipleCategoriaProcedimentos(ids: string[]): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.deleteRequestWithBody<{ids: string[]}, GSResponse<string[]>> (
            state.URL,
            `${BASE}/bulk`,
            { ids }
        )
    }
}