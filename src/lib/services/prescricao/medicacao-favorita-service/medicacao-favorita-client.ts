import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  CreateMedicacaoFavoritaRequest,
  MedicacaoFavoritaDTO,
} from '@/types/dtos/prescricao/medicacao-favorita.dtos'

const BASE = '/client/prescricao/MedicacaoFavorita'

export class MedicacaoFavoritaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  getByMedicoId(
    medicoId: string,
    tipoLinha?: number
  ): Promise<ResponseApi<GSResponse<MedicacaoFavoritaDTO[]>>> {
    const qs = tipoLinha != null ? `?tipoLinha=${tipoLinha}` : ''
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/by-medico/${medicoId}${qs}`
    )
  }

  create(
    payload: CreateMedicacaoFavoritaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${id}`)
  }
}
