import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AntecedentesPessoaisDTO,
  AntecedentesPessoaisTableDTO,
  AntecedentesPessoaisTableFilterRequest,
  CreateAntecedentesPessoaisRequest,
  UpdateAntecedentesPessoaisRequest,
} from '@/types/dtos/saude/antecedentes-pessoais.dtos'

const BASE = '/client/antecedentes/AntecedentesPessoais'

export class AntecedentesPessoaisClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getAntecedentesPessoaisPaginated(
    params: PaginatedRequest & { filters?: AntecedentesPessoaisTableFilterRequest['filters'] }
  ): Promise<ResponseApi<PaginatedResponse<AntecedentesPessoaisTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: AntecedentesPessoaisTableFilterRequest['filters'] },
      PaginatedResponse<AntecedentesPessoaisTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<AntecedentesPessoaisDTO>> {
    return this.httpClient.getRequest<AntecedentesPessoaisDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateAntecedentesPessoaisRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateAntecedentesPessoaisRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateAntecedentesPessoaisRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateAntecedentesPessoaisRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}

