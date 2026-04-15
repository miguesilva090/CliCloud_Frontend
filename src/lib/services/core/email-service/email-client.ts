import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarTemplatesFluxoEmailRequest,
  AtualizarConfiguracaoEmailAutomaticaRequest,
  AtualizarConfiguracaoEmailRequest,
  ConfiguracaoEmailAutomaticaDTO,
  ConfiguracaoEmailDTO,
  HistoricoEmailTabelaDTO,
  HistoricoEmailTabelaFiltro,
  TemplatesFluxoEmailDTO,
} from '@/types/dtos/core/email.dtos'
import type { PaginatedResponse } from '@/types/api/responses'

const BASE = '/client/core/ConfiguracaoEmail'

export class EmailClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoEmailDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(payload: AtualizarConfiguracaoEmailRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }

  async getConfiguracoesAutomaticas(): Promise<ResponseApi<GSResponse<ConfiguracaoEmailAutomaticaDTO[]>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/automaticos`)
  }

  async updateConfiguracaoAutomatica(
    codigo: string,
    payload: AtualizarConfiguracaoEmailAutomaticaRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/automaticos/${codigo}`, payload)
  }

  async getHistoricoPaginado(
    payload: HistoricoEmailTabelaFiltro,
  ): Promise<ResponseApi<PaginatedResponse<HistoricoEmailTabelaDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/historico/paginado`, payload)
  }

  async getTemplatesFluxo(): Promise<ResponseApi<GSResponse<TemplatesFluxoEmailDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/templates-fluxo`)
  }

  async updateTemplatesFluxo(
    payload: AtualizarTemplatesFluxoEmailRequest,
  ): Promise<ResponseApi<GSResponse<boolean>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/templates-fluxo`, payload)
  }
}
