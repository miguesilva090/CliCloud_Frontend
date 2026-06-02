import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  AdmissaoDTO,
  AdmissaoPaginatedRequest,
  AdmissaoTableDTO,
  CreateAdmissaoRequest,
  FechoDiarioRequest,
  FechoDiarioResultDTO,
  PromoverAdmissaoResultDTO,
  UpdateAdmissaoRequest,
  AdmissaoObservacoesDTO,
  AppendAdmissaoObservacaoRequest,
  DesmarcarAdmissaoRequest,
  PromoverAdmissaoLoteRequest,
  AdmissaoDebitoFaturacaoDTO,
} from '@/types/dtos/consultas/admissao.dtos'

const ADMISSOES_BASE = '/client/consultas/admissoes-administrativo'
const FECHO_BASE = '/client/consultas/fecho-diario-administrativo'

export class AdmissaoAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: AdmissaoPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<AdmissaoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${ADMISSOES_BASE}/paginated`, params)
  }

  public async getById(id: string): Promise<ResponseApi<GSResponse<AdmissaoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${ADMISSOES_BASE}/${id}`)
  }

  public async getDebitoFaturacao(
    id: string,
  ): Promise<ResponseApi<GSResponse<AdmissaoDebitoFaturacaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<AdmissaoDebitoFaturacaoDTO>>(
      state.URL,
      `${ADMISSOES_BASE}/${id}/debito-faturacao`,
    )
  }

  public async getByConsultaMarcacaoId(
    consultaMarcacaoId: string
  ): Promise<ResponseApi<GSResponse<AdmissaoDTO | null>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${ADMISSOES_BASE}/por-marcacao/${consultaMarcacaoId}`
    )
  }

  public async create(
    payload: CreateAdmissaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, ADMISSOES_BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateAdmissaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${ADMISSOES_BASE}/${id}`, payload)
  }

  public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${ADMISSOES_BASE}/${id}`)
  }

  public async confirmar(
    id: string,
    confirmado: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/confirmar`,
      confirmado
    )
  }

  public async setEfetuado(
    id: string,
    efetuado: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${ADMISSOES_BASE}/${id}/efetuado`, efetuado)
  }

  public async setConfirmaConsulta(
    id: string,
    confirmaConsulta: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/confirma-consulta`,
      confirmaConsulta
    )
  }

  public async setEmTratamento(
    id: string,
    emTratamento: boolean
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/em-tratamento`,
      emTratamento
    )
  }

  public async desmarcar(
    id: string,
    payload: DesmarcarAdmissaoRequest = {}
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/desmarcar`,
      payload
    )
  }

  public async promoverLote(
    payload: PromoverAdmissaoLoteRequest
  ): Promise<ResponseApi<GSResponse<FechoDiarioResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${ADMISSOES_BASE}/promover-lote`, payload)
  }

  public async promoverParaConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<PromoverAdmissaoResultDTO>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/promover-consulta`,
      {}
    )
  }

  public async getObservacoes(
    id: string
  ): Promise<ResponseApi<GSResponse<AdmissaoObservacoesDTO>>> {
    return this.httpClient.getRequest(state.URL, `${ADMISSOES_BASE}/${id}/observacoes`)
  }

  public async appendObservacao(
    id: string,
    payload: AppendAdmissaoObservacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${ADMISSOES_BASE}/${id}/observacoes`,
      payload
    )
  }

  public async contarFecho(data: string): Promise<ResponseApi<GSResponse<number>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${FECHO_BASE}/contagem?data=${encodeURIComponent(data)}`
    )
  }

  public async executarFecho(
    payload: FechoDiarioRequest
  ): Promise<ResponseApi<GSResponse<FechoDiarioResultDTO>>> {
    return this.httpClient.postRequest(state.URL, FECHO_BASE, payload)
  }

}