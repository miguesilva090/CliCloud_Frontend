import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  GoniometriasLightDTO,
  GoniometriasTableDTO,
  GoniometriasDTO,
  CreateGoniometriasRequest,
  UpdateGoniometriasRequest,
} from '@/types/dtos/goniometrias/goniometrias.dtos'

const BASE = '/client/tratamentos/Goniometrias'

export class GoniometriasClient extends BaseApiClient {
    constructor(idFuncionalidade: string) {
        super(idFuncionalidade)
    }

    //full list 
    public async getGoniometrias(
        keyword?: string
    ): Promise<ResponseApi<GSResponse<GoniometriasDTO[]>>> {
        const url = keyword
          ? `${BASE}?keyword=${encodeURIComponent(keyword)}`
          : BASE
        return this.httpClient.getRequest<GSResponse<GoniometriasDTO[]>>(
          state.URL,
          url
        )
    }

    //lightweight list
    public async getGoniometriasLight(
        keyword?: string
    ): Promise<ResponseApi<GSResponse<GoniometriasLightDTO[]>>> {
        const url = keyword 
          ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}`
          : `${BASE}/light`

        return this.httpClient.getRequest<GSResponse<GoniometriasLightDTO[]>>(
            state.URL, 
            url
        )
    }

    //paginated list (table DTO)
    public async getGoniometriasPaginated(
        params: PaginatedRequest
    ): Promise<ResponseApi<PaginatedResponse<GoniometriasTableDTO>>> {
        return this.httpClient.postRequest<
            PaginatedRequest,
            PaginatedResponse<GoniometriasTableDTO>
        >(state.URL, `${BASE}/paginated`, params)
    }

    // all (non-paginated table DTO)
    public async getAllGoniometrias(
        body: unknown
    ): Promise<ResponseApi<GSResponse<GoniometriasTableDTO[]>>> {
        return this.httpClient.postRequest<
            typeof body, 
            GSResponse<GoniometriasTableDTO[]>
        >(state.URL, `${BASE}/all`, body)
    }

    // single by Id

    public async getGoniometria(
        id: string
    ): Promise<ResponseApi<GSResponse<GoniometriasDTO>>> {
        return this.httpClient.getRequest<GSResponse<GoniometriasDTO>>(
            state.URL, 
            `${BASE}/${id}`
        )
    }

    // single by Descricao (exact match)
    public async getGoniometriaByDescricao(
        descricao: string
    ): Promise<ResponseApi<GSResponse<GoniometriasDTO>>> {
        return this.httpClient.getRequest<GSResponse<GoniometriasDTO>>(
            state.URL,
            `${BASE}/descricao/${encodeURIComponent(descricao)}`
        )
    }

    // create
    public async createGoniometria(
        body: CreateGoniometriasRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.postRequest<
            CreateGoniometriasRequest,
            GSResponse<string>
        >(state.URL, BASE, body)
    }

    // update
    public async updateGoniometria(
        id:string,
        body: UpdateGoniometriasRequest
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.putRequest<
            UpdateGoniometriasRequest,
            GSResponse<string>
        >(state.URL, `${BASE}/${id}`, body)
    }

    // delete single 

    public async deleteGoniometria(
        id:string
    ): Promise<ResponseApi<GSResponse<string>>> {
        return this.httpClient.deleteRequest<GSResponse<string>>(
            state.URL,
            `${BASE}/${id}`
        )
    }

    // delete multiple

    public async deleteMultipleGoniometrias(
        body: {ids: string[]}
    ): Promise<ResponseApi<GSResponse<string[]>>> {
        return this.httpClient.deleteRequestWithBody<
            typeof body, 
            GSResponse<string[]>
        >(state.URL, `${BASE}/bulk`, body)
    }
}