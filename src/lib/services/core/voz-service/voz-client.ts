import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfiguracaoVozRequest,
  ConfiguracaoVozDTO,
  ConfiguracaoVozOpcoesDTO,
} from '@/types/dtos/core/voz.dtos'

const BASE = '/client/core/Voz'

export class VozClient extends BaseApiClient {
  async getOpcoes(): Promise<ResponseApi<GSResponse<ConfiguracaoVozOpcoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao/opcoes`)
  }

  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoVozDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfiguracaoVozRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }
}
