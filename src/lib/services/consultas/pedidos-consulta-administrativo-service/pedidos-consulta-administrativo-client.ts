import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  GuardarPedidoConsultaMarcacaoRequest,
  GuardarPedidoConsultaMarcacaoResultDTO,
  PedidoConsultaDTO,
  PedidoConsultaFicheiroDTO,
  PedidoConsultaPaginatedRequest,
  PedidoConsultaTableDTO,
  PedidoConsultaUtentesCandidatosDTO,
} from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'

const BASE = '/client/consultas/pedidos-consulta-administrativo'

export class PedidosConsultaAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: PedidoConsultaPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<PedidoConsultaTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getById(codigo: number): Promise<ResponseApi<GSResponse<PedidoConsultaDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${codigo}`)
  }

  public async setRecusado(
    codigo: number,
    recusado: boolean
  ): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${codigo}/recusado`, { recusado })
  }

  public async delete(codigo: number): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${codigo}`)
  }

  public async deleteMultiple(
    codigos: number[]
  ): Promise<ResponseApi<GSResponse<number[]>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/delete-multiple`, codigos)
  }

  public async downloadFicheiro(
    codigo: number
  ): Promise<ResponseApi<GSResponse<PedidoConsultaFicheiroDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${codigo}/ficheiro`)
  }

  public async getUtentesCandidatos(
    codigo: number
  ): Promise<ResponseApi<GSResponse<PedidoConsultaUtentesCandidatosDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${codigo}/utentes-candidatos`)
  }

  public async criarUtente(
    codigo: number,
    forcar = false
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<undefined, GSResponse<string>>(
      state.URL,
      `${BASE}/${codigo}/criar-utente?forcar=${forcar ? 'true' : 'false'}`,
      undefined
    )
  }

  public async guardarMarcacao(
    codigo: number,
    payload: GuardarPedidoConsultaMarcacaoRequest
  ): Promise<ResponseApi<GSResponse<GuardarPedidoConsultaMarcacaoResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${codigo}/guardar-marcacao`, payload)
  }

  public async enviarEmail(
    codigo: number,
    tipo: number
  ): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.postRequest<undefined, GSResponse<number>>(
      state.URL,
      `${BASE}/${codigo}/enviar-email?tipo=${tipo}`,
      undefined
    )
  }

  public async enviarSms(
    codigo: number,
    tipo: number
  ): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.postRequest<undefined, GSResponse<number>>(
      state.URL,
      `${BASE}/${codigo}/enviar-sms?tipo=${tipo}`,
      undefined
    )
  }
}
