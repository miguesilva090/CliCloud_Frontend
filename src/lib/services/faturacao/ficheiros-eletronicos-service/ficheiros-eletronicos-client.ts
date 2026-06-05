import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
    FicheiroEletronicoRegistoTableDTO,
    GerarFicheiroEletronicoRequest,
    GerarFicheiroEletronicoResponse,
    JuntarFicheirosEletronicosRequest,
} from '@/types/dtos/faturacao/ficheiros-eletronicos.dtos'

const BASE = '/client/faturacao/ficheiros-eletronicos'

export class FicheirosEletronicosClient extends BaseApiClient {
    async listar(sigla: string): Promise<ResponseApi<GSResponse<FicheiroEletronicoRegistoTableDTO[]>>> {
        return this.httpClient.getRequest(state.URL, `${BASE}?sigla=${encodeURIComponent(sigla)}`)
    }

    async gerar(
        payload: GerarFicheiroEletronicoRequest
    ): Promise<ResponseApi<GSResponse<GerarFicheiroEletronicoResponse>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/gerar`, payload)
    }

    async juntar(
        payload: JuntarFicheirosEletronicosRequest,
    ): Promise<ResponseApi<GSResponse<GerarFicheiroEletronicoResponse>>> {
        return this.httpClient.postRequest(state.URL, `${BASE}/juntar`, payload)
    }
}