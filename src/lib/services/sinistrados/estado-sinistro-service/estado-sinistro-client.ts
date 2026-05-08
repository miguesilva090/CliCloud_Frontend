import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type {
  EstadoSinistroDTO,
  CreateEstadoSinistroRequest,
  UpdateEstadoSinistroRequest,
} from '@/types/dtos/sinistrados/estado-sinistro.dto'

const BASE = '/client/sinistrados/EstadoSinistro'


export class EstadoSinistroClient extends BaseApiClient {
    public async getPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<EstadoSinistroDTO>>> {
        return this.httpClient.postRequest(
            state.URL,
            `${BASE}/paginated`,
            params
        )
    }

    public async getById(id: string): Promise<ResponseApi<GSResponse<EstadoSinistroDTO>>> 
    {
        return this.httpClient.getRequest(
            state.URL,
            `${BASE}/${id}`
        )
    }

    public async create(
        payload: CreateEstadoSinistroRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest(
            state.URL,
            BASE,
            payload
        )
    }

    public async update(
        id: string,
        payload: UpdateEstadoSinistroRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest(
            state.URL,
            `${BASE}/${id}`,
            payload
        )
    }

    public async delete(id: string): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest(
            state.URL,
            `${BASE}/${id}`
        )
    }


}