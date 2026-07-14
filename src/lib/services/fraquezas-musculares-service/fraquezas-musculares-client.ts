import state from '@/states/state'
import type {
    GSResponse,
    PaginatedRequest,
    PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    FraquezasMuscularesLightDTO,
    FraquezasMuscularesTableDTO,
} from '@/types/dtos/fraquezas-musculares/fraquezas-musculares.dtos'

const BASE = '/client/tratamentos/FraquezasMusculares'

export class FraquezasMuscularesClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    public async getFraquezasMuscularesLight(
        keyword?: string
    ): Promise<ResponseApi<GSResponse<FraquezasMuscularesLightDTO[]>>> {
        const url = keyword
            ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
            : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<FraquezasMuscularesLightDTO[]>>(
            state.URL,
            url
        )
    }

    public async getFraquezasMuscularesPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<FraquezasMuscularesTableDTO>>> {
        return this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<FraquezasMuscularesTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    public async createFraquezasMusculares(
        body: {
            descricao: string
        }): Promise<ResponseApi<GSResponse<string>>> {
            return this.httpClient.postRequest<typeof body, GSResponse<string>>(
                state.URL,
                BASE, 
                body
            )
        }

    public async updateFraquezasMusculares(
        id: string, 
        body: { descricao:string }
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<typeof body, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    public async deleteFraquezasMusculares(
        id: string
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`	
        )
    }
}