import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CriarTeleconsultaRequest,
  EntrarTeleconsultaRequest,
  GerarLinkUtenteRequest,
  TeleconsultaJoinDTO,
  TeleconsultaSessaoDTO,
} from '@/types/dtos/consultas/teleconsulta.dtos'

const BASE = '/client/consultas/Teleconsulta'

export class TeleconsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async criarOuObterSessao(
    body: CriarTeleconsultaRequest
  ): Promise<ResponseApi<GSResponse<TeleconsultaSessaoDTO>>> {
    return this.httpClient.postRequest<CriarTeleconsultaRequest, GSResponse<TeleconsultaSessaoDTO>>(
      state.URL,
      `${BASE}/sessao`,
      body
    )
  }

  public async obterSessaoPorMarcacao(
    consultaMarcacaoId: string
  ): Promise<ResponseApi<GSResponse<TeleconsultaSessaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<TeleconsultaSessaoDTO>>(
      state.URL,
      `${BASE}/sessao/marcacao/${consultaMarcacaoId}`
    )
  }

  public async obterLinkEntrada(
    sessaoId: string,
    body: EntrarTeleconsultaRequest
  ): Promise<ResponseApi<GSResponse<TeleconsultaJoinDTO>>> {
    return this.httpClient.postRequest<EntrarTeleconsultaRequest, GSResponse<TeleconsultaJoinDTO>>(
      state.URL,
      `${BASE}/sessao/${sessaoId}/entrar`,
      body
    )
  }

  public async gerarLinkUtente(
    sessaoId: string,
    body: GerarLinkUtenteRequest
  ): Promise<ResponseApi<GSResponse<TeleconsultaJoinDTO>>> {
    return this.httpClient.postRequest<GerarLinkUtenteRequest, GSResponse<TeleconsultaJoinDTO>>(
      state.URL,
      `${BASE}/sessao/${sessaoId}/link-utente`,
      body
    )
  }

  public async revogarLinksSessao(sessaoId: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postWithoutDataRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/sessao/${sessaoId}/revogar-links`
    )
  }

  public async terminarSessao(sessaoId: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postWithoutDataRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/sessao/${sessaoId}/terminar`
    )
  }
}
