import state from "@/states/state"
import { BaseApiClient } from "@/lib/base-client"
import type { ResponseApi } from "@/types/responses"
import type {
    GSResponse,
    PaginatedRequest,
    PaginatedResponse,
} from "@/types/api/responses"
import type {
    CorrigirLotesRequest,
    CreateLoteDirectRequest,
    LoteDirectDTO,
    LoteDirectTableDTO,
    TipoLoteLightDTO,
    UpdateLoteDirectRequest,
} from "@/types/dtos/credenciais/lote-direct.dtos"

const BASE = '/client/credenciais/LoteDirect'

export class LoteDirectClient extends BaseApiClient {
    public async getPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<LoteDirectTableDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/paginated`,
            params
        )
    }

    public async getById(
        id: string
    ): Promise<ResponseApi<GSResponse<LoteDirectDTO>>> {
        return this.httpClient.getRequest(
            state.URL,
            `${BASE}/${id}`
        )
    }

    public async create(
        payload: CreateLoteDirectRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(
            state.URL,
            BASE,
            payload
        )
    }

    public async update(
        id: string,
        payload: UpdateLoteDirectRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(
            state.URL,
            `${BASE}/${id}`,
            payload
        )
    }

    public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest(
            state.URL,
            `${BASE}/${id}`
        )
    }

    public async corrigirLotes(
        payload: CorrigirLotesRequest
    ): Promise<ResponseApi<GSResponse<number>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/corrigir-lotes`,
            payload
        )
    }

    public async getTiposLoteLight(): Promise<ResponseApi<GSResponse<TipoLoteLightDTO[]>>> {
        return this.httpClient.getRequest(
            state.URL,
            `${BASE}/tipos-lote/light`
        )
    }
}