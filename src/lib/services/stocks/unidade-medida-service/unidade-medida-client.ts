import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    UnidadeMedidaDTO,
    UnidadeMedidaLightDTO,
    UnidadeMedidaPaginatedRequest,
    UnidadeMedidaSaveBody,
    UnidadeMedidaTableDTO,
} from '@/types/dtos/stocks/unidade-medida.dtos'

const BASE = '/client/stocks/UnidadeMedida'

export class UnidadeMedidaClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getUnidadesMedidaPaginated(
        params: UnidadeMedidaPaginatedRequest,
    ): Promise<ResponseApi<PaginatedResponse<UnidadeMedidaTableDTO>>> {
        return this.httpClient.postRequest<
            UnidadeMedidaPaginatedRequest,
            PaginatedResponse<UnidadeMedidaTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    async getUnidadesMedidaLight(
        keyword = '',
    ): Promise<ResponseApi<GSResponse<UnidadeMedidaLightDTO[]>>> {
        const query = new URLSearchParams()
        if (keyword.trim()) query.set('keyword', keyword.trim())
        const qs = query.toString()
        const url = qs ? `${BASE}/light?${qs}` : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<UnidadeMedidaLightDTO[]>>(
            state.URL,
            url,
        )
    }

    async getUnidadeMedidaById(
        id: string,
    ): Promise<ResponseApi<GSResponse<UnidadeMedidaDTO>>> {
        return this.httpClient.getRequest<GSResponse<UnidadeMedidaDTO>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }

    async createUnidadeMedida(
        body: UnidadeMedidaSaveBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<
            UnidadeMedidaSaveBody,
            GSResponse<string>
        >(state.URL, BASE, body)
    }

    async updateUnidadeMedida(
        id: string,
        body: UnidadeMedidaSaveBody,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<
            UnidadeMedidaSaveBody,
            GSResponse<string>
        >(state.URL, `${BASE}/${id}`, body)
    }

    async deleteUnidadeMedida(
        id: string,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }
}
