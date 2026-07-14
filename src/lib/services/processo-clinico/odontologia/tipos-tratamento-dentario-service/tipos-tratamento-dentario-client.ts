import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { TiposTratamentoDentarioDTO } from '@/types/dtos/odontologia/odontograma-definitivo.dtos'

const BASE = '/client/processo-clinico/odontologia/TiposTratamentoDentario'

type TiposTratamentoDentarioFilters = {
  keyword?: string
}

export type CreateTiposTratamentoDentarioRequest = {
  codigo: string
  descricao: string
  faturavel: boolean
  codigoServicoAssociado: string | null
  nomeServicoAssociado: string | null
  ativo: boolean
}

export type UpdateTiposTratamentoDentarioRequest = CreateTiposTratamentoDentarioRequest

export class TiposTratamentoDentarioClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAll(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<TiposTratamentoDentarioDTO[]>>> {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return this.httpClient.getRequest<GSResponse<TiposTratamentoDentarioDTO[]>>(
      state.URL,
      `${BASE}${params}`,
    )
  }

  async getPaginated(
    params: PaginatedRequest & { filters?: TiposTratamentoDentarioFilters },
  ): Promise<ResponseApi<PaginatedResponse<TiposTratamentoDentarioDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: TiposTratamentoDentarioFilters },
      PaginatedResponse<TiposTratamentoDentarioDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async create(
    body: CreateTiposTratamentoDentarioRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateTiposTratamentoDentarioRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async update(
    id: string,
    body: UpdateTiposTratamentoDentarioRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateTiposTratamentoDentarioRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}

