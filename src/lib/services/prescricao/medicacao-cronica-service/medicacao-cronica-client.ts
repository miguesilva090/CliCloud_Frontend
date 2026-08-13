import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  CreateMedicacaoCronicaRequest,
  MedicacaoCronicaDTO,
} from '@/types/dtos/prescricao/medicacao-cronica.dtos'

const BASE = '/client/prescricao/MedicacaoCronica'

export class MedicacaoCronicaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  getByUtenteId(
    utenteId: string,
    apenasAtivos = true
  ): Promise<ResponseApi<GSResponse<MedicacaoCronicaDTO[]>>> {
    const qs = apenasAtivos ? '?apenasAtivos=true' : '?apenasAtivos=false'
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/by-utente/${utenteId}${qs}`
    )
  }

  create(
    payload: CreateMedicacaoCronicaRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, BASE, payload)
  }

  delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest(state.URL, `${BASE}/${id}`)
  }
}
