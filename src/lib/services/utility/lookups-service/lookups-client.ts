import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  CodigoPostalLightDTO,
  ConcelhoLightDTO,
  DistritoLightDTO,
  FreguesiaLightDTO,
  PaisLightDTO,
  RuaLightDTO,
} from '@/types/dtos/utility/lookups.dtos'

export class UtilityLookupsClient extends BaseApiClient {
  public async getPaisesLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<PaisLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Pais/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Pais/light'
    return this.httpClient.getRequest<GSResponse<PaisLightDTO[]>>(state.URL, url)
  }

  public async getDistritosLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<DistritoLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Distrito/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Distrito/light'
    return this.httpClient.getRequest<GSResponse<DistritoLightDTO[]>>(state.URL, url)
  }

  public async getConcelhosLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<ConcelhoLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Concelho/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Concelho/light'
    return this.httpClient.getRequest<GSResponse<ConcelhoLightDTO[]>>(state.URL, url)
  }

  public async getFreguesiasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<FreguesiaLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Freguesia/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Freguesia/light'
    return this.httpClient.getRequest<GSResponse<FreguesiaLightDTO[]>>(state.URL, url)
  }

  public async getCodigosPostaisLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<CodigoPostalLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/CodigoPostal/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/CodigoPostal/light'
    return this.httpClient.getRequest<GSResponse<CodigoPostalLightDTO[]>>(
      state.URL,
      url
    )
  }

  public async getRuasLight(
    keyword?: string
  ): Promise<ResponseApi<GSResponse<RuaLightDTO[]>>> {
    const url = keyword
      ? `/client/utility/Rua/light?keyword=${encodeURIComponent(keyword)}`
      : '/client/utility/Rua/light'
    return this.httpClient.getRequest<GSResponse<RuaLightDTO[]>>(state.URL, url)
  }
}

