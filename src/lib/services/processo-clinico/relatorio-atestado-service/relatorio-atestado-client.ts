import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

export type RelatorioAtestadoDTO = {
  id: string
  utenteId: string
  medicoId: string
  titulo: string
  textoHtml: string
  assinadoEm?: string | null
  createdOn: string
  medicoNome?: string | null
  medicoNumeroProfissional?: string | null
}

export type CreateRelatorioAtestadoRequest = {
  utenteId: string
  medicoId: string
  titulo: string
  textoHtml: string
}

export type UpdateRelatorioAtestadoRequest = CreateRelatorioAtestadoRequest

const BASE = '/client/processo-clinico/RelatorioAtestado'

export class RelatorioAtestadoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtente(
    utenteId: string,
  ): Promise<ResponseApi<GSResponse<RelatorioAtestadoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<RelatorioAtestadoDTO[]>>(
      state.URL,
      `${BASE}/utente/${utenteId}`,
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<RelatorioAtestadoDTO>>> {
    return this.httpClient.getRequest<GSResponse<RelatorioAtestadoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async create(
    body: CreateRelatorioAtestadoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateRelatorioAtestadoRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async update(
    id: string,
    body: UpdateRelatorioAtestadoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateRelatorioAtestadoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }

  async assinar(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<unknown, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/assinar`,
      {},
    )
  }
}

