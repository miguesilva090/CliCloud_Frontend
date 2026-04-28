import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

export type HistoriaDentariaDTO = {
  id: string
  utenteId: string
  medicoId: string
  dataRegisto: string
  historiaHtml: string
}

export type CreateHistoriaDentariaRequest = {
  utenteId: string
  historiaHtml: string
}

const BASE = '/client/processo-clinico/HistoriaDentaria'

export class HistoriaDentariaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string
  ): Promise<ResponseApi<GSResponse<HistoriaDentariaDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HistoriaDentariaDTO[]>>(
      state.URL,
      `${BASE}/${utenteId}`
    )
  }

  async create(
    body: CreateHistoriaDentariaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateHistoriaDentariaRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }
}

export const HistoriaDentariaService = (idFuncionalidade = 'PClinico_FichaClinica') =>
  new HistoriaDentariaClient(idFuncionalidade)
