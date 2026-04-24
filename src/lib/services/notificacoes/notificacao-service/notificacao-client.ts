import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  NotificacaoDTO,
  NotificacaoTableDTO,
} from '@/types/dtos/notificacoes/notificacao.dtos'

const BASE = '/client/notificacoes'

export type NotificacaoPaginatedRequest = PaginatedRequest & {
  /** 0=inbox, 1=enviadas, 2=atualizações clínica (alinhado ao backend) */
  listMode: number
}

export class NotificacaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getNotificacoesPaginated(
    params: NotificacaoPaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<NotificacaoTableDTO>>> {
    return this.httpClient.postRequest<
      NotificacaoPaginatedRequest,
      PaginatedResponse<NotificacaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  public async getNotificacaoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<NotificacaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<NotificacaoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  public async createNotificacao(body: {
    titulo: string
    descricao?: string | null
    estado: number
    prioridade: number
    notificacaoTipoId: string
    destinatarioUtilizadorId?: string | null
    clinicaDestinoId?: string | null
  }): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<typeof body, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  public async marcarComoLida(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<Record<string, never>, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}/lida`,
      {},
    )
  }

  public async deleteNotificacao(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
