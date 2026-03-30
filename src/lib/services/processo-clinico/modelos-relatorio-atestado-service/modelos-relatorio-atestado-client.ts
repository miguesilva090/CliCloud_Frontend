import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'

export type ModeloRelatorioAtestadoDTO = {
  id: string
  empresaId: string
  medicoId?: string | null
  titulo: string
  textoHtml: string
  createdOn: string
}

export type CreateModeloRelatorioAtestadoRequest = {
  titulo: string
  textoHtml: string
  medicoId?: string | null
}

export type UpdateModeloRelatorioAtestadoRequest = {
  titulo: string
  textoHtml: string
}

const BASE = '/client/processo-clinico/ModelosRelatorioAtestado'

export class ModelosRelatorioAtestadoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAll(): Promise<ResponseApi<GSResponse<ModeloRelatorioAtestadoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<ModeloRelatorioAtestadoDTO[]>>(
      state.URL,
      BASE,
    )
  }

  async create(
    body: CreateModeloRelatorioAtestadoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateModeloRelatorioAtestadoRequest,
      GSResponse<string>
    >(state.URL, BASE, body)
  }

  async update(
    id: string,
    body: UpdateModeloRelatorioAtestadoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateModeloRelatorioAtestadoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, body)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

