import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

export type ReplicarSubsistemasRequest = {
  organismoOrigemId: string
  organismoDestinoId: string
}

export class ReplicarSubsistemasClient extends BaseApiClient {
  async replicar(body: ReplicarSubsistemasRequest): Promise<ResponseApi<GSResponse<any>>> {
    return this.httpClient.postRequest(state.URL, '/client/utility/replicar-subsistemas', body)
  }
}
