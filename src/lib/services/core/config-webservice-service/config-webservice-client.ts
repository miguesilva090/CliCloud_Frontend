import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AtualizarConfigWebServiceRequest,
  ConfigWebServiceDTO,
  ConsultaUtenteRequest,
  ObterTokenAssinadoRequest,
  ObterTokenCredRequest,
  ProxyTokenResultDTO,
  RegistoPrescricaoRequest,
  RegistoPrescricaoRspRequest,
  SpmsSoapOperationResultDTO,
} from '@/types/dtos/core/config-webservice.dtos'

const BASE = '/client/core/ConfigWebService'

export class ConfigWebServiceClient extends BaseApiClient {
  async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfigWebServiceDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
  }

  async updateConfiguracao(
    payload: AtualizarConfigWebServiceRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
  }

  async testarTokenCred(
    payload: ObterTokenCredRequest,
  ): Promise<ResponseApi<GSResponse<ProxyTokenResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-token-cred`, payload)
  }

  async testarTokenCc(
    payload: ObterTokenAssinadoRequest,
  ): Promise<ResponseApi<GSResponse<ProxyTokenResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-token-cc`, payload)
  }

  async testarTokenCom(
    payload: ObterTokenAssinadoRequest,
  ): Promise<ResponseApi<GSResponse<ProxyTokenResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-token-com`, payload)
  }

  async testarConsultaUtente(
    payload: ConsultaUtenteRequest,
  ): Promise<ResponseApi<GSResponse<SpmsSoapOperationResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-consulta-utente`, payload)
  }

  async testarRegistoPrescricao(
    payload: RegistoPrescricaoRequest,
  ): Promise<ResponseApi<GSResponse<SpmsSoapOperationResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-registo-prescricao`, payload)
  }

  async testarRegistoPrescricaoRsp(
    payload: RegistoPrescricaoRspRequest,
  ): Promise<ResponseApi<GSResponse<SpmsSoapOperationResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/testar-registo-prescricao-rsp`, payload)
  }
}
