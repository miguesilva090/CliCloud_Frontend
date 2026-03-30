import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AtestadoDTO,
  AtestadoTableFilterRequest,
  AtestadoTableDTO,
  CreateAtestadoRequest,
} from '@/types/dtos/saude/atestados.dtos'

const BASE = '/client/atestados'

export class AtestadosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  /**
   * POST /client/atestados/Atestado
   * Cria um atestado. Backend devolve Response<Guid> (GSResponse<string>).
   */
  public async createAtestado(
    payload: CreateAtestadoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateAtestadoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/Atestado`,
      payload
    )
  }

  /**
   * POST /client/atestados/Atestado/paginated
   * Lista atestados paginados. Backend devolve PaginatedResponse<AtestadoTableDTO>.
   */
  public async getAtestadosPaginated(
    params: AtestadoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<AtestadoTableDTO>>> {
    return this.httpClient.postRequest<
      AtestadoTableFilterRequest,
      PaginatedResponse<AtestadoTableDTO>
    >(state.URL, `${BASE}/Atestado/paginated`, params)
  }

  /**
   * GET /client/atestados/Atestado/{id}
   * Obtém um atestado por ID.
   */
  public async getAtestado(
    id: string
  ): Promise<ResponseApi<GSResponse<AtestadoDTO>>> {
    return this.httpClient.getRequest<GSResponse<AtestadoDTO>>(
      state.URL,
      `${BASE}/Atestado/${id}`
    )
  }

  /**
   * DELETE /client/atestados/Atestado/{id}
   * Elimina um atestado (soft delete).
   */
  public async deleteAtestado(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/Atestado/${id}`
    )
  }
}
