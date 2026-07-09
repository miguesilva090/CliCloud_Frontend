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
    CorrigirLotesResultDTO,
    CreateLoteDirectRequest,
    LoteDirectAgregadoTableDTO,
    LoteDirectDTO,
    LoteDirectTableDTO,
    TipoLoteLightDTO,
    UpdateLoteDirectRequest,
    ValidarCorrigirLotesDTO,
    PassarParaHistoricoRequest,
    PassarParaHistoricoResultDTO,
    PassarParaAtivoRequest,
    PassarParaAtivoResultDTO,
    ObterNovoLoteRequest,
    ObterNovoLoteResultDTO,
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
    ): Promise<ResponseApi<GSResponse<CorrigirLotesResultDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/corrigir-lotes`,
            payload
        )
    }

    public async validarCorrigirLotes(
        payload: CorrigirLotesRequest
    ): Promise<ResponseApi<GSResponse<ValidarCorrigirLotesDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/corrigir-lotes/validar`,
            payload
        )
    }

    public async getAgregadosPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<LoteDirectAgregadoTableDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/agregados/paginated`,
            params
        )
    }

    public async getTiposLoteLight(): Promise<ResponseApi<GSResponse<TipoLoteLightDTO[]>>> {
        return this.httpClient.getRequest(
            state.URL,
            `${BASE}/tipos-lote/light`
        )
    }

    public async passarParaHistorico(
        payload: PassarParaHistoricoRequest
    ): Promise<ResponseApi<GSResponse<PassarParaHistoricoResultDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/passar-para-historico`,
            payload
        )
    }

    public async passarParaAtivo(
        payload: PassarParaAtivoRequest
    ): Promise<ResponseApi<GSResponse<PassarParaAtivoResultDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/passar-para-ativo`,
            payload
        )
    }

    public async obterNovoLote(
        payload: ObterNovoLoteRequest
    ) : Promise<ResponseApi<GSResponse<ObterNovoLoteResultDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/obter-novo-lote`,
            payload
        )
    }
}