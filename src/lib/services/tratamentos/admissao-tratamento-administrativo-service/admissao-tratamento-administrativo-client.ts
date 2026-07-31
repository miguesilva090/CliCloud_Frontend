import state from '@/states/state'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AdmissaoTratamentoTableDTO,
  AdmissaoTratamentoTableFilterRequest,
  UpdateAdmissaoTratamentoSituacaoRequest,
} from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

const BASE = '/client/tratamentos/admissao-tratamento-administrativo'

export class AdmissaoTratamentoAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPaginated(
    params: AdmissaoTratamentoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<AdmissaoTratamentoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async updateSituacao(
    id: string,
    payload: UpdateAdmissaoTratamentoSituacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(
      state.URL,
      `${BASE}/${id}/situacao`,
      payload
    )
  }
}

export function AdmissaoTratamentoAdministrativoService(
  idFuncionalidade: string
) {
  return new AdmissaoTratamentoAdministrativoClient(idFuncionalidade)
}
