import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    ConsultarUtenteRnuRequest,
    ConsultarUtenteRnuResponse,
} from '@/types/dtos/saude/utente-rnu.dtos'

export class UtentesRnuClient extends BaseApiClient {
    async consultarUtenteRnu(
        payload: ConsultarUtenteRnuRequest,
    ): Promise<ResponseApi<GSResponse<ConsultarUtenteRnuResponse>>> {
        return this.httpClient.postRequest(
            state.URL,
            '/client/utentes/UtenteRnu/consultar',
            payload,
        )
    }
}