import { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import { DataTableFilterField } from '@/components/shared/data-table-types'

export const filterFields: DataTableFilterField<ConcelhoTableDTO>[] = [
  {
    label: 'Nome',
    value: 'nome',
    order: 1,
  },
  {
    label: 'Distrito',
    value: 'distrito.nome',
    order: 2,
  },
  {
    label: 'País',
    value: 'distrito.pais.nome',
    order: 3,
  },
]
