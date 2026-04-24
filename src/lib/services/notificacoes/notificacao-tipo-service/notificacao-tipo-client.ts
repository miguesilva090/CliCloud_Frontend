import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  NotificacaoTipoDTO,
  NotificacaoTipoLightDTO,
  NotificacaoTipoTableDTO,
} from '@/types/dtos/notificacoes/notificacao-tipo.dtos'

const BASE = '/client/notificacoes/tipos'

export class NotificacaoTipoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getNotificacaoTiposLight(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<NotificacaoTipoLightDTO[]>>> {
    const url = keyword
      ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
      : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<NotificacaoTipoLightDTO[]>>(
      state.URL,
      url,
    )
  }

  public async getNotificacaoTiposPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<NotificacaoTipoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<NotificacaoTipoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getNotificacaoTipoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<NotificacaoTipoDTO>>> {
    return this.httpClient.getRequest<GSResponse<NotificacaoTipoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  public async createNotificacaoTipo(body: {
    designacaoTipo: string
    reservadoSistema: boolean
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  public async updateNotificacaoTipo(
    id: string,
    body: { designacaoTipo: string; reservadoSistema: boolean },
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  public async deleteNotificacaoTipo(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
