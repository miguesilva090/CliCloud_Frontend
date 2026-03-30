import state from '@/states/state'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  TecnicoDTO,
  TecnicoLightDTO,
  TecnicoTableDTO,
  TecnicoTableFilterRequest,
  CreateTecnicoRequest,
  UpdateTecnicoRequest,
  HorarioTecnicoDTO,
  HorarioTecnicoDiaDTO,
  CreateHorarioTecnicoRequest,
  UpdateHorarioTecnicoRequest,
  CreateHorarioTecnicoDiaRequest,
  UpdateHorarioTecnicoDiaRequest,
  HorarioTecnicoVariavelDTO,
  CreateHorarioTecnicoVariavelRequest,
  UpdateHorarioTecnicoVariavelRequest,
  FolgasTecnicoDTO,
  CreateFolgasTecnicoRequest,
  UpdateFolgasTecnicoRequest,
} from '@/types/dtos/saude/tecnicos.dtos'

const BASE = '/client/tecnicos'

export class TecnicoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  /**
   * GET /client/tecnicos/Tecnico/light?keyword=
   */
  public async getTecnicosLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<TecnicoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/Tecnico/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/Tecnico/light`
    return this.httpClient.getRequest<GSResponse<TecnicoLightDTO[]>>(
      state.URL,
      url
    )
  }

  /**
   * POST /client/tecnicos/Tecnico/paginated
   */
  public async getTecnicosPaginated(
    params: TecnicoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<TecnicoTableDTO>>> {
    return this.httpClient.postRequest<
      TecnicoTableFilterRequest,
      PaginatedResponse<TecnicoTableDTO>
    >(state.URL, `${BASE}/Tecnico/paginated`, params)
  }

  /**
   * GET /client/tecnicos/Tecnico/{id}
   */
  public async getTecnico(
    id: string
  ): Promise<ResponseApi<GSResponse<TecnicoDTO>>> {
    const url = `${BASE}/Tecnico/${id}`
    return this.httpClient.getRequest<GSResponse<TecnicoDTO>>(state.URL, url)
  }

  /**
   * POST /client/tecnicos/Tecnico
   */
  public async createTecnico(
    payload: CreateTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<CreateTecnicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/Tecnico`,
      payload
    )
  }

  /**
   * PUT /client/tecnicos/Tecnico/{id}
   */
  public async updateTecnico(
    id: string,
    payload: UpdateTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<UpdateTecnicoRequest, GSResponse<string>>(
      state.URL,
      `${BASE}/Tecnico/${id}`,
      payload
    )
  }

  /**
   * DELETE /client/tecnicos/Tecnico/{id}
   */
  public async deleteTecnico(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/Tecnico/${id}`
    )
  }

  // Horário Fixo (HorarioTecnico + HorarioTecnicoDia)

  public async getHorarioTecnicoByTecnicoId(
    tecnicoId: string
  ): Promise<ResponseApi<GSResponse<HorarioTecnicoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioTecnicoDTO[]>>(
      state.URL,
      `${BASE}/HorarioTecnico/tecnico/${tecnicoId}`
    )
  }

  public async getHorarioTecnicoDiaByHorarioTecnicoId(
    horarioTecnicoId: string
  ): Promise<ResponseApi<GSResponse<HorarioTecnicoDiaDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioTecnicoDiaDTO[]>>(
      state.URL,
      `${BASE}/HorarioTecnicoDia/horarioTecnico/${horarioTecnicoId}`
    )
  }

  public async createHorarioTecnico(
    payload: CreateHorarioTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateHorarioTecnicoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnico`, payload)
  }

  public async updateHorarioTecnico(
    id: string,
    payload: UpdateHorarioTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateHorarioTecnicoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnico/${id}`, payload)
  }

  public async createHorarioTecnicoDia(
    payload: CreateHorarioTecnicoDiaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateHorarioTecnicoDiaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnicoDia`, payload)
  }

  public async updateHorarioTecnicoDia(
    id: string,
    payload: UpdateHorarioTecnicoDiaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateHorarioTecnicoDiaRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnicoDia/${id}`, payload)
  }

  // Horário Variável

  public async getHorarioTecnicoVariavelByTecnicoId(
    tecnicoId: string
  ): Promise<ResponseApi<GSResponse<HorarioTecnicoVariavelDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<HorarioTecnicoVariavelDTO[]>>(
      state.URL,
      `${BASE}/HorarioTecnicoVariavel/tecnico/${tecnicoId}`
    )
  }

  public async createHorarioTecnicoVariavel(
    payload: CreateHorarioTecnicoVariavelRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateHorarioTecnicoVariavelRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnicoVariavel`, payload)
  }

  public async updateHorarioTecnicoVariavel(
    id: string,
    payload: UpdateHorarioTecnicoVariavelRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateHorarioTecnicoVariavelRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/HorarioTecnicoVariavel/${id}`, payload)
  }

  public async deleteHorarioTecnicoVariavel(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/HorarioTecnicoVariavel/${id}`
    )
  }

  // Férias / Folgas

  public async getFolgasTecnicoByTecnicoId(
    tecnicoId: string
  ): Promise<ResponseApi<GSResponse<FolgasTecnicoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<FolgasTecnicoDTO[]>>(
      state.URL,
      `${BASE}/FolgasTecnico/tecnico/${tecnicoId}`
    )
  }

  public async createFolgasTecnico(
    payload: CreateFolgasTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateFolgasTecnicoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/FolgasTecnico`, payload)
  }

  public async updateFolgasTecnico(
    id: string,
    payload: UpdateFolgasTecnicoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<
      UpdateFolgasTecnicoRequest,
      GSResponse<string>
    >(state.URL, `${BASE}/FolgasTecnico/${id}`, payload)
  }

  public async deleteFolgasTecnico(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/FolgasTecnico/${id}`
    )
  }
}

