import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  FechoDiarioTratamentoRequest,
  FechoDiarioTratamentoResultDTO,
} from '@/types/dtos/tratamentos/fecho-diario-tratamento.dtos'

const BASE = '/client/tratamentos/fecho-diario-administrativo'

export class FechoDiarioTratamentoAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async contarFecho(
    data: string
  ): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/contagem?data=${encodeURIComponent(data)}`
    )
  }

  public async executarFecho(
    payload: FechoDiarioTratamentoRequest
  ): Promise<ResponseApi<GSResponse<FechoDiarioTratamentoResultDTO>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }
}

export function FechoDiarioTratamentoAdministrativoService(
  idFuncionalidade: string
) {
  return new FechoDiarioTratamentoAdministrativoClient(idFuncionalidade)
}