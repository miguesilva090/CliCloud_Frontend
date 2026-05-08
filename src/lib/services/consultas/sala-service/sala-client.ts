import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  SalaCreateRequest,
  SalaTableDTO,
  SalaUpdateRequest,
} from '@/types/dtos/consultas/sala.dtos'

const BASE = '/client/consultas/Sala'

export class SalaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getSalasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<SalaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<SalaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createSala(
    body: SalaCreateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<SalaCreateRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateSala(
    id: string,
    body: SalaUpdateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<SalaUpdateRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteSala(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
