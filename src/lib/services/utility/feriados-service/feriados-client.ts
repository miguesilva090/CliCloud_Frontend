import state from '@/states/state'
import type {
    GSResponse,
    PaginatedResponse,
} from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type {
    FeriadoDTO,
    CreateFeriadoRequest,
    UpdateFeriadoRequest,
    FeriadoTableFilter,
    InsertFeriadosAnoRequest,
    ImportFeriadosRequest,
} from '@/types/dtos/utility/feriado.dtos'

const BASE = '/client/utility/Feriado'

export class FeriadoClient extends BaseApiClient
{
    constructor(idFuncionalidade: string)
    {
        super(idFuncionalidade)
    }

    public async getFeriados( keyword?: string): Promise<ResponseApi<GSResponse<FeriadoDTO[]>>>
    {
        const url = keyword ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : BASE
        return this.httpClient.getRequest<GSResponse<FeriadoDTO[]>>(state.URL, url)
    }

    public async getFeriadosPaginated(filter: FeriadoTableFilter) : Promise<ResponseApi<PaginatedResponse<FeriadoDTO>>>
    {
        return this.httpClient.postRequest<FeriadoTableFilter, PaginatedResponse<FeriadoDTO>>(
            state.URL,
            `${BASE}/paginated`,
            filter
        )
    }

    public async createFeriado(body: CreateFeriadoRequest) : Promise<ResponseApi<GSResponse<string>>>
    {
        return this.httpClient.postRequest<CreateFeriadoRequest, GSResponse<string>>(
            state.URL,
            BASE,
            body
        )
    }

    public async updateFeriado(
        id: string, 
        body: UpdateFeriadoRequest
    ) : Promise<ResponseApi<GSResponse<string>>>
    {
        return this.httpClient.putRequest<UpdateFeriadoRequest, GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`,
            body
        )
    }

    public async deleteFeriado(id: string) : Promise<ResponseApi<GSResponse<string>>>
    {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`
        )
    }

    public async inserirFeriadosAno(body: InsertFeriadosAnoRequest) : Promise<ResponseApi<GSResponse<number>>>
    {
        return this.httpClient.postRequest<InsertFeriadosAnoRequest, GSResponse<number>>(
            state.URL,
            `${BASE}/inserir-ano`,
            body
        )
    }

    public async importarFeriados( body: ImportFeriadosRequest) : Promise<ResponseApi<GSResponse<number>>>
    {
        return this.httpClient.postRequest<ImportFeriadosRequest, GSResponse<number>>(
            state.URL,
            `${BASE}/importar`,
            body
        )
    }

    public async verificarSeFeriado( dataISO: string) : Promise<ResponseApi<GSResponse<boolean>>>
    {
        return this.httpClient.getRequest<GSResponse<boolean>>(
            state.URL,
            `${BASE}/verificar?data=${encodeURIComponent(dataISO)}`
        )
    }
}

