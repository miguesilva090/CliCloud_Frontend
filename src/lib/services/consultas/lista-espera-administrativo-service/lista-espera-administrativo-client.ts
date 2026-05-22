import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  AppendListaEsperaObservacaoRequest,
  ConverterListaEsperaMarcacaoRequest,
  ConverterListaEsperaMarcacaoResultDTO,
  CreateListaEsperaRequest,
  ListaEsperaDTO,
  ListaEsperaObservacoesDTO,
  ListaEsperaPaginatedRequest,
  ListaEsperaTableDTO,
  UpdateListaEsperaRequest,
} from '@/types/dtos/consultas/lista-espera-administrativo.dtos'

const BASE = '/client/consultas/lista-espera-administrativo'

export class ListaEsperaAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: ListaEsperaPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ListaEsperaTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getById(id: string): Promise<ResponseApi<GSResponse<ListaEsperaDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  public async create(
    payload: CreateListaEsperaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateListaEsperaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/${id}`, payload)
  }

  public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${id}`)
  }

  public async deleteMultiple(
    ids: string[]
  ): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/delete-multiple`, ids)
  }

  public async getObservacoes(
    id: string
  ): Promise<ResponseApi<GSResponse<ListaEsperaObservacoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}/observacoes`)
  }

  public async appendObservacao(
    id: string,
    payload: AppendListaEsperaObservacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/observacoes`, payload)
  }

  public async converterMarcacao(
    id: string,
    payload: ConverterListaEsperaMarcacaoRequest
  ): Promise<ResponseApi<GSResponse<ConverterListaEsperaMarcacaoResultDTO>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${id}/converter-marcacao`,
      payload
    )
  }
}
