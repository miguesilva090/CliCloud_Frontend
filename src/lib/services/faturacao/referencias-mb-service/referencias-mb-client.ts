import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfigReferenciaMbRequest,
  AnularReferenciaMbRequest,
  ConfigReferenciaMbDTO,
  ReferenciaMbTableDTO,
} from '@/types/dtos/faturacao/referencias-mb.dtos'

const BASE = '/client/faturacao/referencias-mb'

export class ReferenciasMbClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfigReferenciaMbDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfigReferenciaMbRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }

  async getCallbackIfThen(): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao/callback-ifthen`)
  }

  async getHistorico(): Promise<ResponseApi<GSResponse<ReferenciaMbTableDTO[]>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/historico`)
  }

  async liquidar(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/liquidar`, {})
  }

  async anular(id: string, payload: AnularReferenciaMbRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/anular`, payload)
  }
}
