import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type {
  CreateMarcacaoAdministrativoRequest,
  DesmarcarMarcacaoAdministrativoRequest,
  MarcacaoAdministrativoDTO,
  MarcacaoAdministrativoPaginatedRequest,
  MarcacaoAdministrativoTableDTO,
  MarcacaoCalendarioDTO,
  MarcacaoCalendarioRequest,
  DisponibilidadeMedicosMesRequest,
  DisponibilidadeMedicoDiaEventoDTO,
  MudarHorarioMarcacaoAdministrativoRequest,
  UpdateMarcacaoAdministrativoRequest,
  SalasDisponiveisRequest,
  SalaDisponivelDTO,
  AssociarSalaMarcacaoRequest,
} from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type {
  TrocaMarcacoesMedicosPreviewDTO,
  TrocaMarcacoesMedicosRequest,
  TrocaMarcacoesMedicosResultDTO,
} from '@/types/dtos/consultas/troca-marcacoes-medicos.dtos'

const BASE = '/client/consultas/marcacoes-administrativo'

export class MarcacoesAdministrativoClient extends BaseApiClient {
  public async getPaginated(
    params: MarcacaoAdministrativoPaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<MarcacaoAdministrativoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async getCalendario(
    params: MarcacaoCalendarioRequest
  ): Promise<ResponseApi<GSResponse<MarcacaoCalendarioDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/calendario`, params)
  }

  public async getDisponibilidadeMedicosMes(
    params: DisponibilidadeMedicosMesRequest
  ): Promise<ResponseApi<GSResponse<DisponibilidadeMedicoDiaEventoDTO[]>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/disponibilidade-medicos-mes`, params)
  }

  public async getById(id: string): Promise<ResponseApi<GSResponse<MarcacaoAdministrativoDTO>>> {
    return this.httpClient.getRequest(state.URL, `${BASE}/${id}`)
  }

  public async create(
    payload: CreateMarcacaoAdministrativoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  public async update(
    id: string,
    payload: UpdateMarcacaoAdministrativoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(state.URL, `${BASE}/${id}`, payload)
  }

  public async desmarcar(
    id: string,
    payload: DesmarcarMarcacaoAdministrativoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/desmarcar`, payload)
  }

  public async mudarHorario(
    id: string,
    payload: MudarHorarioMarcacaoAdministrativoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${id}/mudar-horario`, payload)
  }

  public async previewTrocaMedicos(
    payload: TrocaMarcacoesMedicosRequest
  ): Promise<ResponseApi<GSResponse<TrocaMarcacoesMedicosPreviewDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/troca-medicos/preview`, payload)
  }

  public async executarTrocaMedicos(
    payload: TrocaMarcacoesMedicosRequest
  ): Promise<ResponseApi<GSResponse<TrocaMarcacoesMedicosResultDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/troca-medicos/executar`, payload)
  }

  public async getSalasDisponiveis(
    payload: SalasDisponiveisRequest
  ): Promise<ResponseApi<GSResponse<SalaDisponivelDTO[]>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/salas-disponiveis`, payload)
  }

  public async associarSala(
    marcacaoId: string,
    payload: AssociarSalaMarcacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${marcacaoId}/associar-sala`,
      payload
    )
  }

  public async removerSala(marcacaoId: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${marcacaoId}/remover-sala`)
  }

  public async resolveMedicoLegado(
    key: string
  ): Promise<
    ResponseApi<
      GSResponse<{ medicoId: string; medicoNome?: string | null; letra?: string | null }>
    >
  > {
    const qs = new URLSearchParams({ key })
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/resolve-medico-legado?${qs.toString()}`
    )
  }

  public async sincronizarAdmissao(
    marcacaoId: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(
      state.URL,
      `${BASE}/${marcacaoId}/sincronizar-admissao`,
      {}
    )
  }
}
