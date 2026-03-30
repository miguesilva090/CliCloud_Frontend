import { ColumnDef } from '@tanstack/react-table'
import { filterFields } from '@/pages/base/paises/components/paises-table/paises-constants'
import { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import { useWindowPageState } from '@/stores/use-pages-store'
import {
  getColumnHeader,
  useFilterState,
  separateColumnAndNonColumnFilters,
} from '@/utils/table-utils'
import { useCurrentWindowId } from '@/utils/window-utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BaseFilterControlsProps } from '@/components/shared/data-table-filter-controls-base'

export function PaisesFilterControls({
  table,
  columns,
}: BaseFilterControlsProps<PaisTableDTO>) {
  const windowId = useCurrentWindowId()
  const { filters } = useWindowPageState(windowId)
  const { filterValues, handleFilterChange } = useFilterState(table, filters)

  const renderFilterInput = (column: ColumnDef<PaisTableDTO, unknown>) => {
    if (!('accessorKey' in column) || !column.accessorKey) return null

    const columnId = column.accessorKey.toString()
    const commonInputStyles =
      'w-full justify-start px-4 py-6 text-left font-normal shadow-inner'

    return (
      <Input
        placeholder={`Filtrar por ${getColumnHeader(column, filterFields).toLowerCase()}...`}
        value={filterValues[columnId] ?? ''}
        onChange={(event) => handleFilterChange(columnId, event.target.value)}
        className={commonInputStyles}
      />
    )
  }

  const { columnBasedFilters, nonColumnFilters } =
    separateColumnAndNonColumnFilters(columns, filterFields)

  const commonInputStyles =
    'w-full justify-start px-4 py-6 text-left font-normal shadow-inner'

  // Combine all filters
  const allFilters = [
    ...columnBasedFilters,
    ...nonColumnFilters.map((field) => ({
      type: 'nonColumn' as const,
      field,
      value: field.value.toString(),
      label: field.label,
      order: field.order || 999,
    })),
  ]

  return (
    <Tabs defaultValue='basic' className='w-full'>
      <TabsList className='w-fit'>
        <TabsTrigger value='basic'>Informações Básicas</TabsTrigger>
      </TabsList>
      <TabsContent value='basic' className='mt-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {allFilters.map((item) => {
            if ('accessorKey' in item && item.accessorKey) {
              return (
                <div
                  key={`${item.id}-${item.accessorKey}`}
                  className='space-y-2'
                >
                  <Label className='text-xs font-medium'>
                    {getColumnHeader(item, filterFields)}
                  </Label>
                  {renderFilterInput(item)}
                </div>
              )
            } else if ('type' in item && item.type === 'nonColumn') {
              const fieldId = item.value
              const fieldLabel = item.label

              return (
                <div key={fieldId} className='space-y-2'>
                  <Label className='text-xs font-medium'>{fieldLabel}</Label>
                  <Input
                    placeholder={`Filtrar por ${fieldLabel.toLowerCase()}...`}
                    value={filterValues[fieldId] ?? ''}
                    onChange={(event) =>
                      handleFilterChange(fieldId, event.target.value)
                    }
                    className={commonInputStyles}
                  />
                </div>
              )
            }
            return null
          })}
        </div>
      </TabsContent>
    </Tabs>
  )
}
