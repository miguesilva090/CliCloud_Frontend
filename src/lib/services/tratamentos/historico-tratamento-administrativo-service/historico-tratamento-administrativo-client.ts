import state from '@/states/state'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  HistoricoTratamentoTableDTO,
  HistoricoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'

const BASE = '/client/tratamentos/historico-tratamento-administrativo'

export class HistoricoTratamentoAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPaginated(
    params: HistoricoTratamentoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<HistoricoTratamentoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }
}

export function HistoricoTratamentoAdministrativoService(
  idFuncionalidade: string
) {
  return new HistoricoTratamentoAdministrativoClient(idFuncionalidade)
}
