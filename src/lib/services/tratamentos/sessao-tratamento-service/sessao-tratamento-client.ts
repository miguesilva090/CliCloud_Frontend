import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  SessaoTratamentoAllFilterRequest,
  SessaoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/sessao-tratamento.dtos'

const BASE = '/client/tratamentos/SessaoTratamento'

export class SessaoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAllByTratamentoId(
    tratamentoId: string
  ): Promise<ResponseApi<GSResponse<SessaoTratamentoTableDTO[]>>> {
    const body: SessaoTratamentoAllFilterRequest = {
      filters: [{ id: 'tratamentoId', value: tratamentoId }],
    }
    return this.httpClient.postRequest<
      SessaoTratamentoAllFilterRequest,
      GSResponse<SessaoTratamentoTableDTO[]>
    >(state.URL, `${BASE}/all`, body)
  }
}
