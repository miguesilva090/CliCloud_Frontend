import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MarcacaoConsultaAllFilterRequest,
  MarcacaoConsultaTableDTO,
  UpdateMarcacaoConsultaBody,
} from '@/types/dtos/consultas/marcacao-consulta.dtos'

const BASE = '/client/consultas/MarcacaoConsulta'

export type CreateMarcacaoConsultaBody = {
  consultaId?: string | null
  utenteId: string
  medicoId?: string | null
  especialidadeId?: string | null
  data: string
  horaInic: string
  horaFim?: string | null
  obs?: string | null
  organismoId?: string | null
  motivoConsultaId?: string | null
  tipoAdmissaoId?: string | null
  tipoConsultaId?: string | null
  sendEmail?: boolean
}

export class MarcacaoConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async createMarcacaoConsulta(
    body: CreateMarcacaoConsultaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateMarcacaoConsultaBody, GSResponse<string>>(
      state.URL,
      BASE,
      body
    )
  }

  public async getMarcacaoConsultaAll(
    body?: MarcacaoConsultaAllFilterRequest
  ): Promise<ResponseApi<GSResponse<MarcacaoConsultaTableDTO[]>>> {
    return this.httpClient.postRequest<
      MarcacaoConsultaAllFilterRequest | undefined,
      GSResponse<MarcacaoConsultaTableDTO[]>
    >(state.URL, `${BASE}/all`, body ?? {})
  }

  /** Marcações do dia do médico logado (backend resolve médico por UserId). */
  public async getConsultasDoDia(
    data: string
  ): Promise<ResponseApi<GSResponse<MarcacaoConsultaTableDTO[]>>> {
    const url = `${BASE}/consultas-do-dia?data=${encodeURIComponent(data)}`
    return this.httpClient.getRequest<GSResponse<MarcacaoConsultaTableDTO[]>>(
      state.URL,
      url
    )
  }

  /** Opções do enum StatusConsulta (fonte: backend). */
  public async getStatusConsultaOptions(): Promise<
    ResponseApi<GSResponse<Array<{ value: number; label: string }>>>
  > {
    return this.httpClient.getRequest<
      GSResponse<Array<{ value: number; label: string }>>
    >(state.URL, `${BASE}/status-consulta-options`)
  }

  /** Obter uma marcação por id. */
  public async getMarcacaoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<MarcacaoConsultaTableDTO>>> {
    return this.httpClient.getRequest<GSResponse<MarcacaoConsultaTableDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  /** Atualizar marcação (PUT). */
  public async updateMarcacaoConsulta(
    id: string,
    body: UpdateMarcacaoConsultaBody
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateMarcacaoConsultaBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body
    )
  }

  /** Eliminar marcação. */
  public async deleteMarcacaoConsulta(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}

