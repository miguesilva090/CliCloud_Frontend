import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CartaConducaoLightDTO,
  CartaConducaoRestricoesLightDTO,
} from '@/types/dtos/saude/cartas-conducao.dtos'

const BASE = '/client/cartasconducao'

export class CartasConducaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getCartaConducaoLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<CartaConducaoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/CartaConducao/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/CartaConducao/light`
    return this.httpClient.getRequest<GSResponse<CartaConducaoLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getCartaConducaoRestricoesLight(
    keyword = ''
  ): Promise<ResponseApi<GSResponse<CartaConducaoRestricoesLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/CartaConducaoRestricoes/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/CartaConducaoRestricoes/light`
    return this.httpClient.getRequest<
      GSResponse<CartaConducaoRestricoesLightDTO[]>
    >(state.URL, url)
  }
}
