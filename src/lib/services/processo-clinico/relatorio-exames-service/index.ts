import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

export type RelatorioExamesDTO = {
  id: string
  utenteId: string
  texto?: string | null
  createdOn: string
}

export type CreateRelatorioExamesRequest = {
  utenteId: string
  texto?: string | null
}

export type UpdateRelatorioExamesRequest = CreateRelatorioExamesRequest

const BASE = '/client/processo-clinico/RelatorioExames'

export class RelatorioExamesClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string
  ): Promise<ResponseApi<GSResponse<RelatorioExamesDTO | null>>> {
    return this.httpClient.getRequest<GSResponse<RelatorioExamesDTO | null>>(
      state.URL,
      `${BASE}/${utenteId}`
    )
  }

  async upsert(
    body: UpdateRelatorioExamesRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<UpdateRelatorioExamesRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }
}

export const RelatorioExamesService = (idFuncionalidade = 'PClinico_FichaClinica') =>
  new RelatorioExamesClient(idFuncionalidade)

