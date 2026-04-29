import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

export type ReplicarMargemMedicosRequest = {
  medicoOrigemId: string
  medicoDestinoId: string
}

export class ReplicarMargemMedicosClient extends BaseApiClient {
  async replicar(body: ReplicarMargemMedicosRequest): Promise<ResponseApi<GSResponse<any>>> {
    return this.httpClient.postRequest(state.URL, '/client/utility/replicar-margem-medicos', body)
  }
}
