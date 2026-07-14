import state from '@/states/state'
import type {
    GSResponse,
    PaginatedRequest,
    PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    MotivoAltaLightDTO,
    MotivoAltaTableDTO,
} from '@/types/dtos/motivo-alta/motivo-alta.dtos'

const BASE = '/client/tratamentos/MotivoAlta'

export class MotivoAltaClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    public async getMotivoAltaLight(
        keyword?: string
    ): Promise<ResponseApi<GSResponse<MotivoAltaLightDTO[]>>> {
        const url = keyword
            ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
            : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<MotivoAltaLightDTO[]>>(
            state.URL,
            url
        )
    }

    public async getMotivoAltaPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<MotivoAltaTableDTO>>> {
        return this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<MotivoAltaTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    public async createMotivoAlta(
        body: {
            descricao: string
        }): Promise<ResponseApi<GSResponse<string>>> {
            return this.httpClient.postRequest<typeof body, GSResponse<string>>(
                state.URL,
                BASE,
                body
            )
        }

    public async updateMotivoAlta(
        id: string, 
        body: {descricao:string}
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<typeof body, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    public async deleteMotivoAlta(
        id:string 
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`
        )
    }
}