export interface GSGenericResponse {
  data: string
  messages: Record<string, string[]>
  status: ResponseStatus
}

export interface GSResponseToken {
  sub: string
  email?: string
  /**
   * Alguns backends não incluem nome/apelido no JWT.
   * No CliCloud (saúde), o token inclui tipicamente `email` e `sub`.
   */
  firstName?: string
  lastName?: string
  /**
   * O backend de saúde emite `roles` como string OU string[] (múltiplas claims).
   */
  roles?: string | string[]
  /**
   * Claims específicas do backend de saúde (CliCloud)
   */
  uid?: string
  clinica_id?: string
  code?: string
  /**
   * Claims de versões anteriores (mantidas como opcionais para compatibilidade)
   */
  client_api_key?: string
  license_id?: string
  client_id?: string
  exp: number
  iss?: string
  aud?: string
}

export enum ResponseStatus {
  Success = 0,
  PartialSuccess = 1,
  Failure = 2,
}

export interface GSResponse<T> {
  data?: T
  messages: Record<string, string[]>
  status: ResponseStatus
  /**
   * Alguns endpoints legados devolvem também `succeeded`.
   * O backend atual usa `status` + `messages`.
   */
  succeeded?: boolean
}

export interface TokenResponse {
  token: string
  refreshToken: string
  refreshTokenExpiryTime: string
  expiryTime: string
}

export interface PaginatedRequest {
  pageNumber: number
  pageSize: number
  filters?: Record<string, string> | Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface AppUpdateDTO {
  updateId: string | null
  updateVersion?: string | null
  version?: string | null // Alternative field name from API
  /**
   * 1 = API, 2 = Frontend, 3 = Both
   */
  updateType: number
  isMandatory: boolean
  updateDescription?: string | null
  description?: string | null // Alternative field name from API
  releaseNotes: string | null
  releaseDate: string | null
  // API package fields
  ficheiroUpdateApi?: string | null
  tamanhoFicheiroApi?: number | null
  hashFicheiroApi?: string | null
  // Frontend package fields
  ficheiroUpdateFrontend?: string | null
  tamanhoFicheiroFrontend?: number | null
  hashFicheiroFrontend?: string | null
}

export interface UpdateInfo {
  hasUpdate: boolean
  /** @deprecated Use updatesDisponiveis instead */
  updateId: string | null
  /** @deprecated Use updatesDisponiveis instead */
  updateVersion: string | null
  /**
   * 1 = API, 2 = Frontend, 3 = Both
   * @deprecated Use updatesDisponiveis instead
   */
  updateType: number
  /** True if ANY update in updatesDisponiveis is mandatory */
  isMandatory: boolean
  /** @deprecated Use updatesDisponiveis instead */
  updateDescription: string | null
  /** @deprecated Use updatesDisponiveis instead */
  releaseNotes: string | null
  /** @deprecated Use updatesDisponiveis instead */
  releaseDate: string | null
  // API package fields
  /** @deprecated Use updatesDisponiveis instead */
  ficheiroUpdateApi: string | null
  /** @deprecated Use updatesDisponiveis instead */
  tamanhoFicheiroApi: number | null
  /** @deprecated Use updatesDisponiveis instead */
  hashFicheiroApi: string | null
  // Frontend package fields
  /** @deprecated Use updatesDisponiveis instead */
  ficheiroUpdateFrontend: string | null
  /** @deprecated Use updatesDisponiveis instead */
  tamanhoFicheiroFrontend: number | null
  /** @deprecated Use updatesDisponiveis instead */
  hashFicheiroFrontend: string | null
  /**
   * Array of updates to apply, ordered by version ASC (oldest first).
   * Process them in order when applying updates.
   */
  updatesDisponiveis?: AppUpdateDTO[]
  /**
   * Alternative field name from API (maps to updatesDisponiveis)
   */
  updates?: AppUpdateDTO[]
}

export interface LoginResponse {
  /** Compat: o backend atual devolve um envelope Response<TokenResponse>. */
  status: ResponseStatus
  messages: Record<string, string[]>
  data?: TokenResponse
}
