import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { MotivoConsultaDTO } from '@/types/dtos/consultas/motivo-consulta.dtos'
import type {
  MotivoConsultaCreateRequest,
  MotivoConsultaTableDTO,
  MotivoConsultaUpdateRequest,
} from '@/types/dtos/consultas/motivo-consulta-table.dtos'

const BASE = '/client/consultas/MotivoConsulta'

export class MotivoConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAllMotivosConsulta(): Promise<ResponseApi<GSResponse<MotivoConsultaDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<MotivoConsultaDTO[]>>(state.URL, BASE)
  }

  public async getMotivosConsultaPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<MotivoConsultaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<MotivoConsultaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async createMotivoConsulta(
    body: MotivoConsultaCreateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<MotivoConsultaCreateRequest, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async updateMotivoConsulta(
    id: string,
    body: MotivoConsultaUpdateRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<MotivoConsultaUpdateRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  public async deleteMotivoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
