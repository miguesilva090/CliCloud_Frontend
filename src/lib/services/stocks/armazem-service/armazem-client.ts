import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    ArmazemDTO,
    ArmazemLightDTO,
    ArmazemPaginatedRequest,
    ArmazemSaveBody,
    ArmazemTableDTO,
} from '@/types/dtos/stocks/armazem.dtos'

const BASE = '/client/stocks/Armazem'

export class ArmazemClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getArmazensPaginated(
        params: ArmazemPaginatedRequest,
    ): Promise<ResponseApi<PaginatedResponse<ArmazemTableDTO>>> {
        return this.httpClient.postRequest<
            ArmazemPaginatedRequest,
            PaginatedResponse<ArmazemTableDTO>
            >(state.URL, `${BASE}/paginated`, params)
    }

    async getArmazensLight(
        keyword = ''
    ): Promise<ResponseApi<GSResponse<ArmazemLightDTO[]>>> {
        const query = new URLSearchParams()
        if (keyword.trim()) query.set('keyword', keyword.trim())
        const qs = query.toString()
        const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<ArmazemLightDTO[]>>(
            state.URL,
            url,
        )
    }

    async getArmazemById(
        id: string,
    ): Promise<ResponseApi<GSResponse<ArmazemDTO>>> {
        return this.httpClient.getRequest<GSResponse<ArmazemDTO>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }

    async createArmazem(
        body: ArmazemSaveBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<ArmazemSaveBody, GSResponse<string>>(
            state.URL,
            BASE,
            body,
        )
    }

    async updateArmazem(
        id: string,
        body: ArmazemSaveBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<ArmazemSaveBody, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body,
        )
    }

    async deleteArmazem(
        id: string,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }
}

