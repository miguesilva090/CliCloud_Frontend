import state from '@/states/state'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AppendHistoricoTratamentoObservacaoRequest,
  HistoricoTratamentoObservacoesDTO,
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


  public async passarParaHistorico(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${id}/passar-historico`,
      {}
    )
  }

  public async reabrir(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/reabrir`, {})
  }

  public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${id}`)
  }

  public async getObservacoes(
    id: string
  ): Promise<ResponseApi<GSResponse<HistoricoTratamentoObservacoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}/observacoes`)
  }

  public async appendObservacao(
    id: string,
    payload: AppendHistoricoTratamentoObservacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${id}/observacoes`,
      payload
    )
  }
}

export function HistoricoTratamentoAdministrativoService(
  idFuncionalidade: string 
) {
  return new HistoricoTratamentoAdministrativoClient(idFuncionalidade)
}

