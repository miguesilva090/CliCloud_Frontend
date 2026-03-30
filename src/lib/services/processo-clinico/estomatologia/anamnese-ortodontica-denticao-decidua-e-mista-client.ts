import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
    AnamneseOrtodonticaDenticaoDeciduaeMistaDTO,
    CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
    UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-denticao-decidua-e-mista.dtos'

const BASE = '/client/processo-clinico/AnamneseOrtodonticaDenticaoDeciduaeMista'

export class AnamneseOrtodonticaDenticaoDeciduaeMistaClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getByUtente(
        utenteId: string,
    ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaDenticaoDeciduaeMistaDTO | null>>> {
        return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaDenticaoDeciduaeMistaDTO | null>>(
            state.URL,
            `${BASE}/utente/${utenteId}`,
        )
    }

    async getById(
        id: string,
    ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaDenticaoDeciduaeMistaDTO>>> {
        return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaDenticaoDeciduaeMistaDTO>> (
            state.URL,
            `${BASE}/${id}`,
        )
    }

    async create(
        body: CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest, GSResponse<string>>(
            state.URL,
            BASE,
            body,
        )
    }

    async update(
        id: string,
        body: UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body,
        )
    }

    async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
        )
    }
}