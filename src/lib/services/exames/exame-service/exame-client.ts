import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { ExamePrescricaoReportDTO } from '@/types/dtos/exames/exame'
import type {
  ExameDTO,
  ExameLightDTO,
  ExameTableDTO,
  CreateExameRequest,
  UpdateExameRequest,
} from '@/types/dtos/exames/exame'
import type { ResultadoExameTableDTO } from '@/types/dtos/exames/resultado-exame.dtos'

const BASE = '/client/exames/Exame'

export class ExameClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getReportData(
    id: string
  ): Promise<ResponseApi<GSResponse<ExamePrescricaoReportDTO>>> {
    return this.httpClient.getRequest<GSResponse<ExamePrescricaoReportDTO>>(
      state.URL,
      `${BASE}/${id}/report`
    )
  }

  async getExames(keyword = ''): Promise<ResponseApi<GSResponse<ExameDTO[]>>> {
    const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : `${BASE}`
    return this.httpClient.getRequest<GSResponse<ExameDTO[]>>(state.URL, url)
  }

  async getExamesLight(keyword = ''): Promise<ResponseApi<GSResponse<ExameLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<ExameLightDTO[]>>(state.URL, url)
  }

  async getExamesPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ExameTableDTO>>> {
    return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<ExameTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      params
    )
  }

  async getAllExames(
    body: { filters?: Array<{ id: string; value: string }>; sorting?: Array<{ id: string; desc: boolean }> }
  ): Promise<ResponseApi<GSResponse<ExameTableDTO[]>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<ExameTableDTO[]>>(
      state.URL,
      `${BASE}/all`,
      body
    )
  }

  async getExameById(id: string): Promise<ResponseApi<GSResponse<ExameDTO>>> {
    return this.httpClient.getRequest<GSResponse<ExameDTO>>(state.URL, `${BASE}/${id}`)
  }

  async getResultadosByExame(id: string): Promise<ResponseApi<GSResponse<ResultadoExameTableDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<ResultadoExameTableDTO[]>>(
      state.URL,
      `${BASE}/${id}/resultados`
    )
  }

  async upsertResultadoLinha(
    exameId: string,
    body: { linhaId: string; valor?: string | null; referencia?: string | null; obs?: string | null },
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${exameId}/resultados`,
      body,
    )
  }

  async createExame(body: CreateExameRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateExameRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  async updateExame(id: string, body: UpdateExameRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateExameRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  async deleteExame(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  async deleteMultipleExames(ids: string[]): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.deleteRequestWithBody<{ ids: string[] }, GSResponse<string[]>>(
      state.URL,
      `${BASE}/bulk`,
      { ids }
    )
  }
}