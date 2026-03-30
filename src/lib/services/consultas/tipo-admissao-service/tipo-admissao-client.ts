import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { TipoAdmissaoDTO } from '@/types/dtos/consultas/tipo-admissao.dtos'

const BASE = '/client/consultas/TipoAdmissao'

export class TipoAdmissaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getAllTiposAdmissao(): Promise<ResponseApi<GSResponse<TipoAdmissaoDTO[]>>> {
    return this.httpClient.getRequest<GSResponse<TipoAdmissaoDTO[]>>(state.URL, BASE)
  }
}

