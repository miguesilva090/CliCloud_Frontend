import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CreateQuestionarioUtenteRequest,
  QuestionarioUtenteDTO,
  QuestionarioUtenteTableDTO,
  QuestionarioUtenteTableFilterRequest,
  UpdateQuestionarioUtenteRequest,
} from '@/types/dtos/saude/questionario-utente.dtos'

const BASE = '/client/processo-clinico/QuestionarioUtente'

export class QuestionarioUtenteClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getQuestionariosPaginated(
    params: PaginatedRequest & {
      filters?: QuestionarioUtenteTableFilterRequest['filters']
    }
  ): Promise<ResponseApi<PaginatedResponse<QuestionarioUtenteTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: QuestionarioUtenteTableFilterRequest['filters'] },
      PaginatedResponse<QuestionarioUtenteTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getById(id: string): Promise<ResponseApi<QuestionarioUtenteDTO>> {
    return this.httpClient.getRequest<QuestionarioUtenteDTO>(state.URL, `${BASE}/${id}`)
  }

  async create(
    body: CreateQuestionarioUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.postRequest<CreateQuestionarioUtenteRequest, { data?: string }>(
      state.URL,
      BASE,
      body
    )
  }

  async update(
    id: string,
    body: UpdateQuestionarioUtenteRequest
  ): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.putRequest<UpdateQuestionarioUtenteRequest, { data?: string }>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async delete(id: string): Promise<ResponseApi<{ data?: string }>> {
    return this.httpClient.deleteRequest<{ data?: string }>(state.URL, `${BASE}/${id}`)
  }
}

