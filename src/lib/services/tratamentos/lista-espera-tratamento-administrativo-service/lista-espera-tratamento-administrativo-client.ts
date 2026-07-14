import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  AppendListaEsperaTratamentoObservacaoRequest,
  CreateListaEsperaTratamentoRequest,
  ListaEsperaTratamentoDTO,
  ListaEsperaTratamentoObservacoesDTO,
  ListaEsperaTratamentoPaginatedRequest,
  ListaEsperaTratamentoProximoIdentificadorDTO,
  ListaEsperaTratamentoTableDTO,
  UpdateListaEsperaTratamentoRequest,
} from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'

const BASE = '/client/tratamentos/lista-espera-tratamento-administrativo'

export class ListaEsperaTratamentoAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: ListaEsperaTratamentoPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<ListaEsperaTratamentoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getById(
    id: string
  ): Promise<ResponseApi<GSResponse<ListaEsperaTratamentoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  public async create(
    payload: CreateListaEsperaTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateListaEsperaTratamentoRequest
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
  ): Promise<ResponseApi<GSResponse<ListaEsperaTratamentoObservacoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}/observacoes`)
  }

  public async appendObservacao(
    id: string,
    payload: AppendListaEsperaTratamentoObservacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/observacoes`, payload)
  }

  public async getProximoIdentificador(): Promise<
    ResponseApi<GSResponse<ListaEsperaTratamentoProximoIdentificadorDTO>>
  > {
    return this.httpClient.getRequest(state.URL, `${BASE}/proximo-identificador`)
  }

  public async verificarOrdemDisponivel(
    ordem: number,
    excludeId?: string
  ): Promise<ResponseApi<GSResponse<boolean>>> {
    const qs = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : ''
    return this.httpClient.getRequest(state.URL, `${BASE}/verificar-ordem/${ordem}${qs}`)
  }
}
