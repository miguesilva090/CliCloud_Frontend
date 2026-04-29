import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

export type AtualizarSubsistemasEntidadeRequest = {
  organismoOrigemId: string
  organismoDestinoId: string
}

export class AtualizarSubsistemasEntidadeClient extends BaseApiClient {
  async atualizar(body: AtualizarSubsistemasEntidadeRequest): Promise<ResponseApi<GSResponse<any>>> {
    return this.httpClient.postRequest(state.URL, '/client/utility/atualizar-subsistemas-entidade', body)
  }
}
