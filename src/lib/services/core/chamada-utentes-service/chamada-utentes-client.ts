import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  ChamadaUtenteDadosDTO,
  ChamadaUtenteFilaItemDTO,
  ChamarConsultaRequest,
  ChamarSessaoTratamentoRequest,
} from '@/types/dtos/core/chamada-utentes.dtos'

const BASE = '/client/core/ChamadaUtentes'

export class ChamadaUtentesClient extends BaseApiClient {
  async getDadosChamadaConsulta(
    marcacaoConsultaId: string,
    chamarOutraVez = false
  ): Promise<ResponseApi<GSResponse<ChamadaUtenteDadosDTO>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/consultas/${marcacaoConsultaId}/dados?chamarOutraVez=${chamarOutraVez}`
    )
  }

  async chamarUtenteConsulta(
    marcacaoConsultaId: string,
    payload: ChamarConsultaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/consultas/${marcacaoConsultaId}/chamar`, payload)
  }

  async getFila(tipo?: string): Promise<ResponseApi<GSResponse<ChamadaUtenteFilaItemDTO[]>>> {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''
    return this.httpClient.getRequest(state.URL, `${BASE}/fila${query}`)
  }

  async getDadosChamadaTratamento(
    sessaoTratamentoId: string,
    chamarOutraVez = false
  ): Promise<ResponseApi<GSResponse<ChamadaUtenteDadosDTO>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/tratamentos/${sessaoTratamentoId}/dados?chamarOutraVez=${chamarOutraVez}`
    )
  }

  async chamarUtenteTratamento(
    sessaoTratamentoId: string,
    payload: ChamarSessaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/tratamentos/${sessaoTratamentoId}/chamar`, payload)
  }
}
