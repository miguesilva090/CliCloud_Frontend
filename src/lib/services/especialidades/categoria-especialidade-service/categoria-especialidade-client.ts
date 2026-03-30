import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { CategoriaEspecialidadeTableDTO } from '@/types/dtos/especialidades/categoria-especialidade.dtos'

const BASE = '/client/especialidades/CategoriaEspecialidade'

export interface CategoriaEspecialidadeLightItem {
  id: string
  codigo: string
  descricao: string
}

export class CategoriaEspecialidadeClient extends BaseApiClient {
  /**
   * GET /client/especialidades/CategoriaEspecialidade/light
   */
  public async getCategoriasEspecialidadesLight(
    keyword = ''
  ): Promise<ResponseApi<{ data: CategoriaEspecialidadeLightItem[] }>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest(state.URL, url)
  }

  /**
   * POST /client/especialidades/CategoriaEspecialidade/paginated
   */
  public async getCategoriasEspecialidadesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<CategoriaEspecialidadeTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<CategoriaEspecialidadeTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  /**
   * POST /client/especialidades/CategoriaEspecialidade
   */
  public async createCategoriaEspecialidade(body: {
    Codigo: string
    Descricao: string
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}`,
      body
    )
  }

  /**
   * PUT /client/especialidades/CategoriaEspecialidade/{id}
   */
  public async updateCategoriaEspecialidade(
    id: string,
    body: {
      Codigo: string
      Descricao: string
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  /**
   * DELETE /client/especialidades/CategoriaEspecialidade/{id}
   */
  public async deleteCategoriaEspecialidade(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

