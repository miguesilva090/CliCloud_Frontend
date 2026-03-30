import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { EspecialidadeTableDTO } from '@/types/dtos/especialidades/especialidade.dtos'

const BASE = '/client/especialidades/Especialidade'

export interface EspecialidadeLightItem {
  id: string
  nome: string
  categoriaEspecialidadeId: string | null
  categoriaEspecialidadeDescricao: string | null
}

export class EspecialidadeClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getEspecialidadesLight(
    keyword = ''
  ): Promise<ResponseApi<{ data: EspecialidadeLightItem[] }>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest(state.URL, url)
  }

  public async getEspecialidadesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<EspecialidadeTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<EspecialidadeTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createEspecialidade(body: {
    Nome: string
    CategoriaEspecialidadeId?: string | null
    Fisioterapia: boolean
    Atendimento: boolean
    Globalbooking: boolean
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}`,
      body
    )
  }

  public async updateEspecialidade(
    id: string,
    body: {
      Nome: string
      CategoriaEspecialidadeId?: string | null
      Fisioterapia: boolean
      Atendimento: boolean
      Globalbooking: boolean
    }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteEspecialidade(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
