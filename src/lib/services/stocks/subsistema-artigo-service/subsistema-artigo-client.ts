import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    SubsistemaArtigoCreateBody,
    SubsistemaArtigoDTO,
    SubsistemaArtigoPaginatedRequest,
    SubsistemaArtigoTableDTO,
    SubsistemaArtigoUpdateBody,
} from '@/types/dtos/stocks/subsistema-artigo.dtos'

const BASE = '/client/stocks/SubsistemaArtigo'

export class SubsistemaArtigoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getSubsistemaArtigoPaginated(
        params: SubsistemaArtigoPaginatedRequest,
    ): Promise<ResponseApi<PaginatedResponse<SubsistemaArtigoTableDTO>>> {
        return this.httpClient.postRequest<SubsistemaArtigoPaginatedRequest, PaginatedResponse<SubsistemaArtigoTableDTO>>(
            state.URL,
            `${BASE}/paginated`,
            params
        )
    }

    async getSubsistemaArtigoById(
        id: string,
    ): Promise<ResponseApi<GSResponse<SubsistemaArtigoDTO>>> {
        return this.httpClient.getRequest<GSResponse<SubsistemaArtigoDTO>>(
            state.URL,
            `${BASE}/${id}`
        )
    }
    
    async createSubsistemaArtigo(
        body: SubsistemaArtigoCreateBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<SubsistemaArtigoCreateBody, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    async updateSubsistemaArtigo(
        id: string,
        body: SubsistemaArtigoUpdateBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<SubsistemaArtigoUpdateBody, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    async deleteSubsistemaArtigo(
        id: string,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`
        )
    }
}