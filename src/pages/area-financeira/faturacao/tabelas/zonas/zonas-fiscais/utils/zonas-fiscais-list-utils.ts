import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'
import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'

function filterValue(filters: TableFilter[], id: string): string {
  return filters.find((f) => f.id === id)?.value?.trim() ?? ''
}

export function filterZonasFiscaisRows(
  rows: ZonaFiscalTableDTO[],
  filters: TableFilter[],
): ZonaFiscalTableDTO[] {
  const codigoMin = filterValue(filters, 'codigo')
  const descricao = filterValue(filters, 'descricao')

  return rows.filter((row) => {
    if (codigoMin && row.codigo < Number(codigoMin)) return false

    const desc = row.descricao.toLowerCase()
    if (descricao && !desc.includes(descricao.toLowerCase())) return false

    return true
  })
}

export function sortZonasFiscaisRows(
  rows: ZonaFiscalTableDTO[],
  sorting: Array<{ id: string; desc: boolean }>,
): ZonaFiscalTableDTO[] {
  if (sorting.length === 0) {
    return [...rows].sort((a, b) => a.codigo - b.codigo)
  }

  const { id, desc } = sorting[0]
  const factor = desc ? -1 : 1

  return [...rows].sort((a, b) => {
    if (id === 'codigo') return (a.codigo - b.codigo) * factor
    if (id === 'descricao') {
      return a.descricao.localeCompare(b.descricao, 'pt') * factor
    }
    return 0
  })
}

export function paginateZonasFiscaisRows(
  rows: ZonaFiscalTableDTO[],
  page: number,
  pageSize: number,
): ZonaFiscalTableDTO[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
