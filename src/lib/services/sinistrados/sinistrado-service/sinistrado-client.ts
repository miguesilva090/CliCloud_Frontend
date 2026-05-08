import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type {
  SinistradoDTO,
  SinistradoLinhaServicoDTO,
  SinistradoTableDTO,
  CreateSinistradoRequest,
  UpdateSinistradoRequest,
} from '@/types/dtos/sinistrados/sinistrado.dtos'

const BASE = '/client/sinistrados/Sinistrado'

export class SinistradoClient extends BaseApiClient {
  public async getPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<SinistradoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getById(
    id: string
  ): Promise<ResponseApi<GSResponse<SinistradoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  public async create(
    payload: CreateSinistradoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateSinistradoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/${id}`, payload)
  }

  public async moveToHistory(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/move-to-history`, {})
  }

  public async restoreFromHistory(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${id}/restore-from-history`,
      {}
    )
  }

  public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${id}`)
  }

  public async getUnbilledServicesByUtenteId(
    utenteId: string
  ): Promise<ResponseApi<GSResponse<SinistradoLinhaServicoDTO[]>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/utente/${utenteId}/servicos-nao-faturados`
    )
  }
}
