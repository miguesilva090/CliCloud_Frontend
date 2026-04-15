import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfigCartaConducaoRequest,
  ConfigCartaConducaoDTO,
} from '@/types/dtos/core/config-carta-conducao.dtos'

const BASE = '/client/core/ConfigCartaConducao'

export class ConfigCartaConducaoClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfigCartaConducaoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfigCartaConducaoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }
}
