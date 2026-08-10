import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import type {
  CreateUtentePatologiaComparticipacaoRequest,
  ReplaceUtentePatologiasComparticipacaoRequest,
  UtentePatologiaComparticipacaoDTO,
} from '@/types/dtos/prescricao/utente-patologia-comparticipacao.dtos'

const BASE = '/client/utentes/UtentePatologiaComparticipacao'

export class UtentePatologiaComparticipacaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getByUtenteId(
    utenteId: string
  ): Promise<ResponseApi<GSResponse<UtentePatologiaComparticipacaoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<UtentePatologiaComparticipacaoDTO[]>>(
      state.URL,
      `${BASE}/by-utente/${utenteId}`
    )
  }

  async create(
    request: CreateUtentePatologiaComparticipacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<
      CreateUtentePatologiaComparticipacaoRequest,
      GSResponse<string>
    >(state.URL, BASE, request)
  }

  async replaceByUtente(
    utenteId: string,
    request: ReplaceUtentePatologiasComparticipacaoRequest
  ): Promise<ResponseApi<GSResponse<UtentePatologiaComparticipacaoDTO[]>>> {
    return this.httpClient.putRequest<
      ReplaceUtentePatologiasComparticipacaoRequest,
      GSResponse<UtentePatologiaComparticipacaoDTO[]>
    >(state.URL, `${BASE}/by-utente/${utenteId}`, request)
  }

  async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
