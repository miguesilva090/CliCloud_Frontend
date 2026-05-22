import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { HistoricoConsultaAdministrativoRowDTO } from '@/types/dtos/consultas/historico-consulta-administrativo.dtos'
import type { AdmissaoDTO, UpdateAdmissaoRequest } from '@/types/dtos/consultas/admissao.dtos'

const BASE = '/client/consultas/historico-administrativo'

export type HistoricoConsultaAdministrativoVista = 'datas' | 'utentes' | 'medicos' | 'organismos'

export type HistoricoConsultasAdministrativoPaginatedRequest = PaginatedRequest & {
  vista: HistoricoConsultaAdministrativoVista
}

export class HistoricoConsultasAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPaginated(
    params: HistoricoConsultasAdministrativoPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<HistoricoConsultaAdministrativoRowDTO>>> {
    return this.httpClient.postRequest<
      HistoricoConsultasAdministrativoPaginatedRequest,
      PaginatedResponse<HistoricoConsultaAdministrativoRowDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getConsultaForEdit(
    id: string
  ): Promise<ResponseApi<GSResponse<AdmissaoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  async updateConsultaHistorico(
    id: string,
    payload: UpdateAdmissaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/${id}`, payload)
  }
}
