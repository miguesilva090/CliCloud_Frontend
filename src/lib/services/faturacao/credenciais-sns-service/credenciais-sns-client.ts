import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  CredenciaisSnsLoteTableDTO,
  CredenciaisSnsModulo,
  CredenciaisSnsTableFilter,
  DeleteCredenciaisSnsRequest,
} from '@/types/dtos/faturacao/credenciais-sns.dtos'

const BASE = '/client/faturacao/credenciais-sns'

export class CredenciaisSnsClient extends BaseApiClient {
  public async getPaginated(
    modulo: CredenciaisSnsModulo,
    params: CredenciaisSnsTableFilter
  ): Promise<ResponseApi<PaginatedResponse<CredenciaisSnsLoteTableDTO>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${modulo}/paginated`,
      params
    )
  }

  public async delete(
    modulo: CredenciaisSnsModulo,
    payload: DeleteCredenciaisSnsRequest
  ): Promise<ResponseApi<GSResponse<boolean>>> {
    return this.httpClient.deleteRequestWithBody<
      DeleteCredenciaisSnsRequest,
      GSResponse<boolean>
    >(state.URL, `${BASE}/${modulo}`, payload)
  }
}
