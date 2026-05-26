import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  ConsultaDoDiaDTO,
  ConsultaTableDTO,
  IniciarAtendimentoConsultaDTO,
  IniciarAtendimentoConsultaRequest,
} from '@/types/dtos/consultas/consulta.dtos'

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

  async iniciarAtendimento(
    request: IniciarAtendimentoConsultaRequest
  ): Promise<ResponseApi<GSResponse<IniciarAtendimentoConsultaDTO>>> {
    return this.httpClient.postRequest<
      IniciarAtendimentoConsultaRequest,
      GSResponse<IniciarAtendimentoConsultaDTO>
    >(state.URL, `${BASE}/iniciar-atendimento`, request)
  }

  async getConsultasDoDia(params: {
    data?: string
    desmarcadas?: boolean
  }): Promise<ResponseApi<GSResponse<ConsultaDoDiaDTO[]>>> {
    const search = new URLSearchParams()

    if (params.data) search.set('data', params.data)
    if (params.desmarcadas != null) search.set('desmarcadas', String(params.desmarcadas))

    const suffix = search.toString()
    return this.httpClient.getRequest<GSResponse<ConsultaDoDiaDTO[]>>(
      state.URL,
      `${BASE}/consultas-do-dia${suffix ? `?${suffix}` : ''}`
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
