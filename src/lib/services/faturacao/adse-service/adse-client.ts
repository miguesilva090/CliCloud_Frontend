import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AdseOrganismoLookupDTO,
  AtualizarWebserviceAdseRequest,
  WebserviceAdseDTO,
} from '@/types/dtos/faturacao/adse.dtos'

const BASE = '/client/faturacao/adse'

export class AdseClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<WebserviceAdseDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarWebserviceAdseRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }

  async getOrganismos(): Promise<ResponseApi<GSResponse<AdseOrganismoLookupDTO[]>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/lookups/organismos`)
  }
}
