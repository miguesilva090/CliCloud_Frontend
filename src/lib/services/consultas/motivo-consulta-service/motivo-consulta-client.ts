import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { MotivoConsultaDTO } from '@/types/dtos/consultas/motivo-consulta.dtos'

const BASE = '/client/consultas/MotivoConsulta'

export class MotivoConsultaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAllMotivosConsulta(): Promise<ResponseApi<GSResponse<MotivoConsultaDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<MotivoConsultaDTO[]>>(state.URL, BASE)
  }
}
