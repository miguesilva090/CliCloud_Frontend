import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  HorasPossiveisTecnicoRequest,
  HorasPossiveisTecnicoResponse,
  UnidadesTempoTecnicoResponse,
} from '@/types/dtos/tratamentos/disponibilidade-tecnico-tratamento.dtos'

const BASE = '/client/tratamentos/DisponibilidadeTecnicoTratamento'

export class DisponibilidadeTecnicoTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getUnidadesTempo(
    tecnicoId: string
  ): Promise<ResponseApi<GSResponse<UnidadesTempoTecnicoResponse>>> {
    return this.httpClient.getRequest<GSResponse<UnidadesTempoTecnicoResponse>>(
      state.URL,
      `${BASE}/unidades-tempo/${tecnicoId}`
    )
  }

  async getHorasPossiveis(
    body: HorasPossiveisTecnicoRequest
  ): Promise<ResponseApi<GSResponse<HorasPossiveisTecnicoResponse>>> {
    return this.httpClient.postRequest<
      HorasPossiveisTecnicoRequest,
      GSResponse<HorasPossiveisTecnicoResponse>
    >(state.URL, `${BASE}/horas-possiveis`, body)
  }
}

export function DisponibilidadeTecnicoTratamentoService(
  idFuncionalidade = 'PClinico_Tratamentos'
) {
  return new DisponibilidadeTecnicoTratamentoClient(idFuncionalidade)
}
