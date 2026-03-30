import state from '@/states/state'
import type {
    GSResponse,
    PaginatedRequest,
    PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    MotivosDesmarcacaoLightDTO,
    MotivosDesmarcacaoTableDTO,
} from '@/types/dtos/motivos-desmarcacao/motivos-desmarcacao.dtos'

const BASE = '/client/tratamentos/MotivosDesmarcacao'

export class MotivosDesmarcacaoClient extends BaseApiClient {
constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    public async getMotivosDesmarcacaoLight(
        keyword?: string
    ): Promise<ResponseApi<GSResponse<MotivosDesmarcacaoLightDTO[]>>> {
        const url = keyword
            ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
            : `${BASE}/light`
        return this.httpClient.getRequest<GSResponse<MotivosDesmarcacaoLightDTO[]>>(
            state.URL,
            url
        )
    }

    public async getMotivosDesmarcacaoPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<MotivosDesmarcacaoTableDTO>>> {
        return this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<MotivosDesmarcacaoTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    public async createMotivosDesmarcacao(
        body: {
            descricao: string
        }): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<typeof body, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    public async updateMotivosDesmarcacao(
        id: string,
        body: {
            descricao: string
        }): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<typeof body, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }
    
    public async deleteMotivosDesmarcacao(
        id: string
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`
        )
    }
}