import { format } from 'date-fns'

export const DEFAULT_CONSULTA_FILTERS: Array<{ id: string; value: string }> = [
  { id: 'efectuado', value: 'true' },
]

export function buildConsultaFilters(
  utenteId: string,
  selectedDate: Date | null
): Array<{ id: string; value: string }> {
  const filters = [...DEFAULT_CONSULTA_FILTERS]
  if (utenteId) {
    filters.push({ id: 'utenteId', value: utenteId })
  }
  if (selectedDate) {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    filters.push({ id: 'data_de', value: dateStr }, { id: 'data_ate', value: dateStr })
  }
  return filters
}
