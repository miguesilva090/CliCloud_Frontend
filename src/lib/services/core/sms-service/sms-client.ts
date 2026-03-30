import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    ConfiguracaoSmsDTO,
    AtualizarConfiguracaoSmsRequest,
    EnviarSmsTesteRequest,
} from '@/types/dtos/core/sms.dtos'

const BASE = '/client/core/Sms'

export class SmsClient extends BaseApiClient {
    async getConfiguracaoAtual(): Promise<ResponseApi<GSResponse<ConfiguracaoSmsDTO>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}/configuracao`)
    }

    async updateConfiguracao(payload: AtualizarConfiguracaoSmsRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(state.URL, `${BASE}/configuracao`, payload)
    }

    async enviarTeste(payload: EnviarSmsTesteRequest): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/enviar-teste`, payload)
    }
}
