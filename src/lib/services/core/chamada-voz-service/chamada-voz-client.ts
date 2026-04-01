import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfiguracaoChamadaVozRequest,
  ConfiguracaoChamadaVozDTO,
  ConfiguracaoChamadaVozOpcoesDTO,
} from '@/types/dtos/core/chamada-voz.dtos'

const BASE = '/client/core/ChamadaVoz'

export class ChamadaVozClient extends BaseApiClient {
  async getOpcoes(): Promise<ResponseApi<GSResponse<ConfiguracaoChamadaVozOpcoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao/opcoes`)
  }

  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoChamadaVozDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfiguracaoChamadaVozRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }
}
