import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { PeriocidadeTratamentoLightDTO } from '@/types/dtos/tratamentos/periocidade-tratamento.dtos'

const BASE = '/client/tratamentos/PeriocidadeTratamento'

export class PeriocidadeTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPeriocidadesLight(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<PeriocidadeTratamentoLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<PeriocidadeTratamentoLightDTO[]>>(state.URL, url)
  }
}

