import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CentroSaudeTableDTO,
  CentroSaudeDTO,
  CentroSaudeLightDTO,
  CentroSaudeTableFilterRequest,
  CreateCentroSaudeRequest,
  UpdateCentroSaudeRequest,
} from '@/types/dtos/saude/centro-saude.dtos'

const BASE = '/client/centro-saude/CentroSaude'

export class CentroSaudeClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getCentrosSaudePaginated(
    params: CentroSaudeTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<CentroSaudeTableDTO>>> {
    return this.httpClient.postRequest<
      CentroSaudeTableFilterRequest,
      PaginatedResponse<CentroSaudeTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getCentroSaudeLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<CentroSaudeLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<CentroSaudeLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getCentroSaude(
    id: string
  ): Promise<ResponseApi<GSResponse<CentroSaudeDTO>>> {
    return this.httpClient.getRequest<GSResponse<CentroSaudeDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async createCentroSaude(
    payload: CreateCentroSaudeRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateCentroSaudeRequest,
      GSResponse<string>
    >(state.URL, BASE, payload)
  }

  public async updateCentroSaude(
    id: string,
    payload: UpdateCentroSaudeRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateCentroSaudeRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/${id}`, payload)
  }

  public async deleteCentroSaude(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
