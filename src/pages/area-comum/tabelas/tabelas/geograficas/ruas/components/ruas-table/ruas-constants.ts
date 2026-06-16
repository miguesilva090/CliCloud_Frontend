import { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { DataTableFilterField } from '@/components/shared/data-table-types'

export const filterFields: DataTableFilterField<RuaTableDTO>[] = [
  {
    label: 'Nome',
    value: 'nome',
    order: 1,
  },
  {
    label: 'Freguesia',
    value: 'freguesia.nome',
    order: 2,
  },
  {
    label: 'Código Postal',
    value: 'codigopostal.codigo',
    order: 3,
  },
  {
    label: 'País',
    value: 'freguesia.concelho.distrito.pais.nome',
    order: 4,
  },
  {
    label: 'Distrito',
    value: 'freguesia.concelho.distrito.nome',
    order: 5,
  },
  {
    label: 'Concelho',
    value: 'freguesia.concelho.nome',
    order: 6,
  },
]
