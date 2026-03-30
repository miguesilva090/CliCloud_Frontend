import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MedicoLightDTO,
  MedicoDTO,
  MedicoTableDTO,
  MedicoTableFilterRequest,
  CreateMedicoRequest,
  UpdateMedicoRequest,
  HorarioMedicoDTO,
  HorarioMedicoDiaDTO,
  CreateHorarioMedicoRequest,
  UpdateHorarioMedicoRequest,
  CreateHorarioMedicoDiaRequest,
  UpdateHorarioMedicoDiaRequest,
  HorarioMedicoVariavelDTO,
  CreateHorarioMedicoVariavelRequest,
  UpdateHorarioMedicoVariavelRequest,
  FolgasMedicoDTO,
  CreateFolgasMedicoRequest,
  UpdateFolgasMedicoRequest,
} from '@/types/dtos/saude/medicos.dtos'

const BASE = '/client/medicos'

export class MedicosClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  /**
   * GET /client/medicos/Medico/light?keyword=
   */
  public async getMedicosLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<MedicoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/Medico/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/Medico/light`
    return this.httpClient.getRequest<GSResponse<MedicoLightDTO[]>>(
      state.URL,
      url
    )
  }

  /**
   * POST /client/medicos/Medico/paginated
   */
  public async getMedicosPaginated(
    params: MedicoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<MedicoTableDTO>>> {
    return this.httpClient.postRequest<
      MedicoTableFilterRequest,
      PaginatedResponse<MedicoTableDTO>
    >(state.URL, `${BASE}/Medico/paginated`, params)
  }

  /**
   * GET /client/medicos/Medico/{id}
   */
  public async getMedico(id: string): Promise<ResponseApi<GSResponse<MedicoDTO>>> {
    const url = `${BASE}/Medico/${id}`
    return this.httpClient.getRequest<GSResponse<MedicoDTO>>(state.URL, url)
  }

  /**
   * GET /client/medicos/Medico/current
   * Devolve o médico associado ao utilizador autenticado (IdUtilizador).
   */
  public async getCurrentMedico(): Promise<ResponseApi<GSResponse<MedicoDTO | null>>> {
    const url = `${BASE}/Medico/current`
    return this.httpClient.getRequest<GSResponse<MedicoDTO | null>>(state.URL, url)
  }

  /**
   * POST /client/medicos/Medico
   */
  public async createMedico(
    payload: CreateMedicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/Medico`,
      payload
    )
  }

  /**
   * PUT /client/medicos/Medico/{id}
   */
  public async updateMedico(
    id: string,
    payload: UpdateMedicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/Medico/${id}`,
      payload
    )
  }

  /**
   * DELETE /client/medicos/Medico/{id}
   */
  public async deleteMedico(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/Medico/${id}`
    )
  }

  // Horário Fixo (HorarioMedico + HorarioMedicoDia)
  public async getHorarioMedicoByMedicoId(medicoId: string): Promise<ResponseApi<GSResponse<HorarioMedicoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioMedicoDTO[]>>(
      state.URL,
      `${BASE}/HorarioMedico/medico/${medicoId}`
    )
  }

  public async getHorarioMedicoDiaByHorarioMedicoId(horarioMedicoId: string): Promise<ResponseApi<GSResponse<HorarioMedicoDiaDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioMedicoDiaDTO[]>>(
      state.URL,
      `${BASE}/HorarioMedicoDia/horarioMedico/${horarioMedicoId}`
    )
  }

  public async createHorarioMedico(payload: CreateHorarioMedicoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateHorarioMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedico`,
      payload
    )
  }

  public async updateHorarioMedico(id: string, payload: UpdateHorarioMedicoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateHorarioMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedico/${id}`,
      payload
    )
  }

  public async createHorarioMedicoDia(payload: CreateHorarioMedicoDiaRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateHorarioMedicoDiaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoDia`,
      payload
    )
  }

  public async updateHorarioMedicoDia(id: string, payload: UpdateHorarioMedicoDiaRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateHorarioMedicoDiaRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoDia/${id}`,
      payload
    )
  }

  public async deleteHorarioMedicoDia(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoDia/${id}`
    )
  }

  // Horário Variável
  public async getHorarioMedicoVariavelByMedicoId(medicoId: string): Promise<ResponseApi<GSResponse<HorarioMedicoVariavelDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioMedicoVariavelDTO[]>>(
      state.URL,
      `${BASE}/HorarioMedicoVariavel/medico/${medicoId}`
    )
  }

  public async createHorarioMedicoVariavel(payload: CreateHorarioMedicoVariavelRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateHorarioMedicoVariavelRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoVariavel`,
      payload
    )
  }

  public async updateHorarioMedicoVariavel(id: string, payload: UpdateHorarioMedicoVariavelRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateHorarioMedicoVariavelRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoVariavel/${id}`,
      payload
    )
  }

  public async deleteHorarioMedicoVariavel(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioMedicoVariavel/${id}`
    )
  }

  // Férias / Folgas
  public async getFolgasMedicoByMedicoId(medicoId: string): Promise<ResponseApi<GSResponse<FolgasMedicoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<FolgasMedicoDTO[]>>(
      state.URL,
      `${BASE}/FolgasMedico/medico/${medicoId}`
    )
  }

  public async createFolgasMedico(payload: CreateFolgasMedicoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateFolgasMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/FolgasMedico`,
      payload
    )
  }

  public async updateFolgasMedico(id: string, payload: UpdateFolgasMedicoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateFolgasMedicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/FolgasMedico/${id}`,
      payload
    )
  }

  public async deleteFolgasMedico(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/FolgasMedico/${id}`
    )
  }
}
