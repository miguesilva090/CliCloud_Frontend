import { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'
import { DataTableFilterField } from '@/components/shared/data-table-types'

export const filterFields: DataTableFilterField<FreguesiaTableDTO>[] = [
  {
    label: 'Nome',
    value: 'nome',
    order: 1,
  },
  {
    label: 'Concelho',
    value: 'concelho.nome',
    order: 2,
  },
  {
    label: 'Distrito',
    value: 'concelho.distrito.nome',
    order: 3,
  },
  {
    label: 'País',
    value: 'concelho.distrito.pais.nome',
    order: 4,
  },
]
