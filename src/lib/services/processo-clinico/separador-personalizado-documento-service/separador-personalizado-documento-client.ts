import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

const BASE = '/client/processo-clinico/SeparadorPersonalizadoDocumento'

export interface SeparadorPersonalizadoModeloDTO {
  id?: string | null
  existe: boolean
  textoHtml: string
}

export interface UpsertSeparadorPersonalizadoModeloRequest {
  separadorId: string
  tituloSeparador: string
  textoHtml: string
}

export interface GerarImpressaoSeparadorPersonalizadoRequest {
  separadorId: string
  tituloSeparador: string
  apenasHoje: boolean
  campos: Array<{
    nomeCampo: string
    historicoTexto: string
  }>
}

export interface GerarImpressaoSeparadorPersonalizadoResponse {
  modeloVazio: boolean
  html: string
}

export class SeparadorPersonalizadoDocumentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getModelo(separadorId: string): Promise<ResponseApi<SeparadorPersonalizadoModeloDTO>> {
    return this.httpClient.getRequest<SeparadorPersonalizadoModeloDTO>(
      state.URL,
      `${BASE}/modelo/${separadorId}`,
    )
  }

  async upsertModelo(
    body: UpsertSeparadorPersonalizadoModeloRequest,
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<UpsertSeparadorPersonalizadoModeloRequest, { data?: string }>(
      state.URL,
      `${BASE}/modelo`,
      body,
    )
  }

  async gerarImpressao(
    body: GerarImpressaoSeparadorPersonalizadoRequest,
  ): Promise<ResponseApi<GerarImpressaoSeparadorPersonalizadoResponse>> {
    return this.httpClient.postRequest<
      GerarImpressaoSeparadorPersonalizadoRequest,
      GerarImpressaoSeparadorPersonalizadoResponse
    >(state.URL, `${BASE}/impressao`, body)
  }
}
