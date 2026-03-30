import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { EstadosDentariosDTO } from '@/types/dtos/odontologia/odontograma-definitivo.dtos'

const BASE = '/client/processo-clinico/odontologia/EstadosDentarios'

type EstadosDentariosFilters = {
  keyword?: string
}

export type CreateEstadosDentariosRequest = {
  codigo: string
  descricao: string
  estadoPadrao: boolean
  ativo: boolean
}

export type UpdateEstadosDentariosRequest = CreateEstadosDentariosRequest

export class EstadosDentariosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAll(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<EstadosDentariosDTO[]>>> {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<GSResponse<EstadosDentariosDTO[]>>(
      state.URL,
      `${BASE}${params}`,
    )
  }

  async getPaginated(
    params: PaginatedRequest & { filters?: EstadosDentariosFilters },
  ): Promise<ResponseApi<PaginatedResponse<EstadosDentariosDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: EstadosDentariosFilters },
      PaginatedResponse<EstadosDentariosDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async create(
    body: CreateEstadosDentariosRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateEstadosDentariosRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async update(
    id: string,
    body: UpdateEstadosDentariosRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateEstadosDentariosRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

