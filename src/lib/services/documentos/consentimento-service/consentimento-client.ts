import state from '@/states/state'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
    CriarPedidoConsentimentoRequest,
    MarcarPedidoConsentimentoAssinadoRequest,
    PedidoConsentimentoDTO,
} from '@/types/dtos/documentos/consentimento.dtos'

const BASE = '/client/documentos/consentimentos'

export class ConsentimentoClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    async criarPedido(
        body: CriarPedidoConsentimentoRequest
    ): Promise<ResponseApi<GSResponse<PedidoConsentimentoDTO>>> {
        return this.httpClient.postRequest<CriarPedidoConsentimentoRequest, GSResponse<PedidoConsentimentoDTO>>(
            state.URL,
            `${BASE}/pedidos`,
            body
        )
    }

    async obterPedido(id: string): Promise<ResponseApi<GSResponse<PedidoConsentimentoDTO>>> {
        return this.httpClient.getRequest<GSResponse<PedidoConsentimentoDTO>>(
            state.URL,
            `${BASE}/pedidos/${id}`
        )
    }

    async obterPedidos(
        utenteId?: string,
        estado?: number
    ): Promise<ResponseApi<GSResponse<PedidoConsentimentoDTO[]>>> {
        const params = new URLSearchParams()
        if(utenteId) params.append('utenteId', utenteId)
        if(estado !== undefined) params.append('estado', String(estado)) 

        const query = params.toString()
        const url = query ? `${BASE}/pedidos?${query}` : `${BASE}/pedidos`

        return this.httpClient.getRequest<GSResponse<PedidoConsentimentoDTO[]>>(
            state.URL,
            url
        )
    }

    async cancelarPedido(
        id: string,
        observacoes?: string
    ): Promise<ResponseApi<GSResponse<string>>> {
        const query = observacoes?.trim()
            ? `?observacoes=${encodeURIComponent(observacoes.trim())}`
            : ''
        
        return this.httpClient.postRequest<undefined, GSResponse<string>>(
            state.URL,
            `${BASE}/pedidos/${id}/cancelar${query}`,
            undefined

        )
    }

    async marcarAssinado(
        id: string,
        body: MarcarPedidoConsentimentoAssinadoRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<MarcarPedidoConsentimentoAssinadoRequest, GSResponse<string>>(
            state.URL, 
            `${BASE}/pedidos/${id}/assinar`,
            body
        )
    }
}