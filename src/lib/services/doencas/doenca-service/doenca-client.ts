import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { DoencaDTO, DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'

const BASE = '/client/doencas/Doenca'

/** Body compatível com DoencaTableFilter (keyword, parentId) */
interface DoencaPaginatedBody {
  pageNumber: number
  pageSize: number
  sorting?: Array<{ id: string; desc: boolean }>
  keyword?: string
  parentId?: string
}

function buildDoencaPaginatedBody(
  params: PaginatedRequest
): DoencaPaginatedBody {
  const filters = params.filters as Record<string, string> | undefined
  const keyword =
    filters?.keyword ?? filters?.title ?? filters?.code ?? ''
  const parentId = filters?.parentId
  return {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    sorting: params.sorting,
    keyword: keyword || undefined,
    parentId: parentId || undefined,
  }
}

export class DoencaClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getDoencasPaginated(
    params: PaginatedRequest
  ): Promise<ResponseApi<PaginatedResponse<DoencaTableDTO>>> {
    const body = buildDoencaPaginatedBody(params)
    return this.httpClient.postRequest<
      DoencaPaginatedBody,
      PaginatedResponse<DoencaTableDTO>
    >(state.URL, `${BASE}/paginated`, body)
  }

  public async getDoenca(id: string): Promise<ResponseApi<GSResponse<DoencaDTO>>> {
    return this.httpClient.getRequest<GSResponse<DoencaDTO>>(
      state.URL,
      `${BASE}/${id}`
    )
  }

  public async updateDoenca(
    id: string,
    body: { title: string; code?: string | null }
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<typeof body, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      {
        title: body.title,
        code: body.code?.trim() || null,
      }
    )
  }

  public async deleteDoenca(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`
    )
  }
}
