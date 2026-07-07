import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

export type FundirUtentesRequest = {
  utenteOrigemId: string
  utenteApagarId: string
}

export type FundirUtentesResponse = {
  utenteOrigemId: string
  utenteApagadoId: string
}

export class FundirUtentesClient extends BaseApiClient {
  async fundir(
    body: FundirUtentesRequest
  ): Promise<ResponseApi<GSResponse<FundirUtentesResponse>>> {
    return this.httpClient.postRequest(state.URL, '/client/utility/fundir-utentes', body)
  }
}
