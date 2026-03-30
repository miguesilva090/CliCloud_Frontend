/**
 * Tipos comuns para filtros/paginação usados nos endpoints "table" e "all"
 * (seguindo o mesmo padrão do backend: PaginationFilter + TableFilter + TanstackColumnOrder).
 */

export type TanstackSorting = Array<{ id: string; desc: boolean }>

export type TableFilter = { id: string; value: string }

export interface PaginationFilterRequest {
  pageNumber: number
  pageSize: number
  sorting?: TanstackSorting
}

export interface TableFilterRequest extends PaginationFilterRequest {
  filters: TableFilter[]
}

export interface AllFilterRequest {
  filters?: TableFilter[]
  sorting?: TanstackSorting
}

