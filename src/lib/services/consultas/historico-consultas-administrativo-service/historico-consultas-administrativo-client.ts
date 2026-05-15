import state from '@/states/state'
import type { PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { HistoricoConsultaAdministrativoRowDTO } from '@/types/dtos/consultas/historico-consulta-administrativo.dtos'

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
}
