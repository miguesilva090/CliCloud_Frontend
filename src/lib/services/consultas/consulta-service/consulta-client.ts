import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'

const BASE = '/client/consultas/Consulta'

export class ConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getConsultaPaginated(
    params: PaginatedRequest & { filters?: Array<{ id: string; value: string }> }
  ): Promise<ResponseApi<PaginatedResponse<ConsultaTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest & { filters?: Array<{ id: string; value: string }> },
      PaginatedResponse<ConsultaTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async createConsultaFromMarcacao(
    marcacaoId: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<undefined, GSResponse<string>>(
      state.URL,
      `${BASE}/from-marcacao/${marcacaoId}`,
      undefined as unknown as undefined
    )
  }

  async finalizarConsulta(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<undefined, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/finalizar`,
      undefined as unknown as undefined
    )
  }
}
