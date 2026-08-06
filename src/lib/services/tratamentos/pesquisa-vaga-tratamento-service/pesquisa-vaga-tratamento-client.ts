import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  PesquisaVagaRequest,
  PesquisaVagaResponse,
} from '@/types/dtos/tratamentos/pesquisa-vaga.dtos'

const BASE = '/client/tratamentos/pesquisa-vaga-tratamento'

export class PesquisaVagaTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async pesquisar(
    body: PesquisaVagaRequest
  ): Promise<ResponseApi<GSResponse<PesquisaVagaResponse>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/pesquisar`, body)
  }
}

export function PesquisaVagaTratamentoService(
  idFuncionalidade = 'PClinico_Tratamentos'
) {
  return new PesquisaVagaTratamentoClient(idFuncionalidade)
}
