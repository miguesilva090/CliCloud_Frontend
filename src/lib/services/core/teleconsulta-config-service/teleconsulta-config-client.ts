import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfiguracaoTeleconsultaRequest,
  ConfiguracaoTeleconsultaDTO,
} from '@/types/dtos/core/teleconsulta-config.dtos'

const BASE = '/client/core/Teleconsulta'

export class TeleconsultaConfigClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoTeleconsultaDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfiguracaoTeleconsultaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }
}
