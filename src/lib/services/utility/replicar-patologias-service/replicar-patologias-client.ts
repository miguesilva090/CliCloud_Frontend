import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

export type ReplicarPatologiasRequest = {
    organismoOrigemId: string
    organismoDestinoId: string
    substituirExistentes: boolean
}

export class ReplicarPatologiasClient extends BaseApiClient {
    async replicar(body: ReplicarPatologiasRequest): Promise<ResponseApi<GSResponse<any>>> {
        return this.httpClient.postRequest(state.URL, '/client/utility/replicar-patologias', body)
    } 
}