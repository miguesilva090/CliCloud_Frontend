import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import { GSResponse, PaginatedResponse } from '@/types/api/responses'
import { ResponseApi } from '@/types/responses'
import type {
    FamiliaArtigoBreadcrumbDTO,
    FamiliaArtigoDTO,
    FamiliaArtigoLightDTO,
    FamiliaArtigoPaginatedRequest,
    FamiliaArtigoSaveBody,
    FamiliaArtigoTableDTO,
} from '@/types/dtos/stocks/familia-artigo.dtos'

const BASE = '/client/stocks/FamiliaArtigo'

export class FamiliaArtigoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }


    async getFamiliasArtigoPaginated(
        params: FamiliaArtigoPaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<FamiliaArtigoTableDTO>>> {
        return this.httpClient.postRequest<
        FamiliaArtigoPaginatedRequest,
        PaginatedResponse<FamiliaArtigoTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    async getFamiliasArtigoLight(
        keyword = '',
    ): Promise<ResponseApi<GSResponse<FamiliaArtigoLightDTO[]>>> {
        const query = new URLSearchParams()
        if (keyword.trim()) query.set('keyword', keyword.trim())
            const qs = query.toString()
            const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<FamiliaArtigoLightDTO[]>>(
            state.URL, 
            url,
        )
    }

    async getAncestors(
        parentId: string | null,
    ): Promise<ResponseApi<GSResponse<FamiliaArtigoBreadcrumbDTO[]>>> {
        const query = new URLSearchParams()
        if (parentId) query.set('parentId', parentId)
            const qs = query.toString()
            const url = qs ? `${BASE}/ancestors?${qs}` : `${BASE}/ancestors`
        return this.httpClient.getRequest<GSResponse<FamiliaArtigoBreadcrumbDTO[]>>(
            state.URL,
            url,
        )
    }

    async getFamiliaArtigoById(
        id: string,
    ): Promise<ResponseApi<GSResponse<FamiliaArtigoDTO>>> {
        return this.httpClient.getRequest<GSResponse<FamiliaArtigoDTO>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }

    async createFamiliaArtigo(
        body: FamiliaArtigoSaveBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<FamiliaArtigoSaveBody, GSResponse<string>>(
            state.URL,
            BASE, 
            body,
        )
    }

    async updateFamiliaArtigo(
        id: string,
        body: Omit<FamiliaArtigoSaveBody, 'parentId'>,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<
        Omit<FamiliaArtigoSaveBody, 'parentId'>,
        GSResponse<string>
        >(state.URL, `${BASE}/${id}`, body)
    }

    async deleteFamiliaArtigo(
        id: string,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }
}