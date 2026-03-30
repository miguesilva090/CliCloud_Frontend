import { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'
import { DataTableFilterField } from '@/components/shared/data-table-types'

export const filterFields: DataTableFilterField<CodigoPostalTableDTO>[] = [
  {
    label: 'Código',
    value: 'codigo',
    order: 1,
  },
  {
    label: 'Localidade',
    value: 'localidade',
    order: 2,
  },
]
