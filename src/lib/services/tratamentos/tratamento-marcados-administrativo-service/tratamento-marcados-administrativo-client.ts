import state from '@/states/state'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TratamentoMarcadosTableDTO,
  TratamentoMarcadosTableFilterRequest,
} from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'

const BASE = '/client/tratamentos/tratamento-marcados-administrativo'

export class TratamentoMarcadosAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPaginated(
    params: TratamentoMarcadosTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<TratamentoMarcadosTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }
}

export function TratamentoMarcadosAdministrativoService(
  idFuncionalidade: string
) {
  return new TratamentoMarcadosAdministrativoClient(idFuncionalidade)
}
