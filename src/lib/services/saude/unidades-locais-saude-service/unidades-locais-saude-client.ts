import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { UnidadesLocaisSaudeLightDTO } from '@/types/dtos/saude/unidades-locais-saude.dtos'

const BASE = '/client/unidades-locais-saude/UnidadesLocaisSaude'

export class UnidadesLocaisSaudeClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getUnidadesLocaisSaudeLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<UnidadesLocaisSaudeLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`

    return this.httpClient.getRequest<GSResponse<UnidadesLocaisSaudeLightDTO[]>>(
      state.URL,
      url
    )
  }
}

