import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AntecedentesCirurgicosDTO,
  AntecedentesCirurgicosTableDTO,
  AntecedentesCirurgicosTableFilterRequest,
  CreateAntecedentesCirurgicosRequest,
  UpdateAntecedentesCirurgicosRequest,
} from '@/types/dtos/saude/antecedentes-cirurgicos.dtos'

const BASE = '/client/antecedentes/AntecedentesCirurgicos'

export class AntecedentesCirurgicosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAntecedentesCirurgicosPaginated(
    params: PaginatedRequest & { filters?: AntecedentesCirurgicosTableFilterRequest['filters'] }
  ): Promise<ResponseApi<PaginatedResponse<AntecedentesCirurgicosTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: AntecedentesCirurgicosTableFilterRequest['filters'] },
      PaginatedResponse<AntecedentesCirurgicosTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<AntecedentesCirurgicosDTO>> {
    return this.httpClient.getRequest<AntecedentesCirurgicosDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateAntecedentesCirurgicosRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateAntecedentesCirurgicosRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateAntecedentesCirurgicosRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateAntecedentesCirurgicosRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}

