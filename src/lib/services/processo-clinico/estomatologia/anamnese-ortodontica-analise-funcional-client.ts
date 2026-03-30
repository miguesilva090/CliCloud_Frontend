import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
    AnamneseOrtodonticaAnaliseFuncionalDTO,
    CreateAnamneseOrtodonticaAnaliseFuncionalRequest,
    UpdateAnamneseOrtodonticaAnaliseFuncionalRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-funcional.dtos'

const BASE = '/client/processo-clinico/AnamneseOrtodonticaAnaliseFuncional'

export class AnamneseOrtodonticaAnaliseFuncionalClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async getByUtente(
        utenteId: string,
    ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseFuncionalDTO | null>>> {
        return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaAnaliseFuncionalDTO | null>>(
            state.URL,
            `${BASE}/utente/${utenteId}`,
        )
    }

    async getById(
        id: string,
    ): Promise<ResponseApi<GSResponse<AnamneseOrtodonticaAnaliseFuncionalDTO>>> {
        return this.httpClient.getRequest<GSResponse<AnamneseOrtodonticaAnaliseFuncionalDTO>> (
            state.URL,
            `${BASE}/${id}`,
        )
    }

    async create(
        body: CreateAnamneseOrtodonticaAnaliseFuncionalRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<CreateAnamneseOrtodonticaAnaliseFuncionalRequest, GSResponse<string>> (
            state.URL, 
            BASE,
            body,
        )
    }

    async update(
        id: string,
        body: UpdateAnamneseOrtodonticaAnaliseFuncionalRequest,
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<UpdateAnamneseOrtodonticaAnaliseFuncionalRequest, GSResponse<string>> (
            state.URL, 
            `${BASE}/${id}`,
            body,
        )
    }

    async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>> (
            state.URL,
            `${BASE}/${id}`,
        )
    }
    
}