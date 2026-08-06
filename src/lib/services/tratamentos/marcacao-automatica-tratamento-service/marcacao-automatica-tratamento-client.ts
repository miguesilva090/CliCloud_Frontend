import state from "@/states/state";
import { BaseApiClient } from "@/lib/base-client";
import type { ResponseApi } from "@/types/responses"
import type { GSResponse } from "@/types/api/responses"
import type {
    MarcacaoAutomaticaConfirmRequest,
    MarcacaoAutomaticaPreviewRequest,
    MarcacaoAutomaticaPreviewResponse,
} from "@/types/dtos/tratamentos/marcacao-automatica-tratamento.dtos"

const BASE = "/client/tratamentos/marcacao-automatica-tratamento"

export class MarcacaoAutomaticaTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async preview(
    body: MarcacaoAutomaticaPreviewRequest
  ): Promise<ResponseApi<GSResponse<MarcacaoAutomaticaPreviewResponse>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/preview`, body)
  }

  async confirm(
    body: MarcacaoAutomaticaConfirmRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/confirm`, body)
  }
}

export function MarcacaoAutomaticaTratamentoService(
  idFuncionalidade = 'PClinico_Tratamentos'
) {
  return new MarcacaoAutomaticaTratamentoClient(idFuncionalidade)
}