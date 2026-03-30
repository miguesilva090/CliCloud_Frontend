import { ColumnDef } from '@tanstack/react-table'
import { filterFields } from '@/pages/base/concelhos/components/concelhos-table/concelhos-constants'
import { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
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

export function ConcelhosFilterControls({
  table,
  columns,
}: BaseFilterControlsProps<ConcelhoTableDTO>) {
  const windowId = useCurrentWindowId()
  const { filters } = useWindowPageState(windowId)
  const { filterValues, handleFilterChange } = useFilterState(table, filters)

  const renderFilterInput = (column: ColumnDef<ConcelhoTableDTO, unknown>) => {
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

  // Helper function to check if a filter is geographic
  const isGeographicFilter = (fieldId: string) => {
    return (
      fieldId.includes('pais') ||
      fieldId.includes('distrito') ||
      fieldId.includes('concelho')
    )
  }

  // Organize filters into tabs
  const basicFilters = [
    ...columnBasedFilters.filter((column) => {
      if (!('accessorKey' in column) || !column.accessorKey) return false
      return !isGeographicFilter(column.accessorKey.toString())
    }),
    ...nonColumnFilters.filter((field) => {
      return !isGeographicFilter(field.value.toString())
    }),
  ]

  const locationFilters = [
    ...columnBasedFilters.filter((column) => {
      if (!('accessorKey' in column) || !column.accessorKey) return false
      return isGeographicFilter(column.accessorKey.toString())
    }),
    ...nonColumnFilters.filter((field) => {
      return isGeographicFilter(field.value.toString())
    }),
  ]

  const renderFilterItem = (item: any) => {
    if ('accessorKey' in item && item.accessorKey) {
      return (
        <div key={`${item.id}-${item.accessorKey}`} className='space-y-2'>
          <Label className='text-xs font-medium'>
            {getColumnHeader(item, filterFields)}
          </Label>
          {renderFilterInput(item)}
        </div>
      )
    } else if ('value' in item) {
      const fieldId = item.value.toString()
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
  }

  return (
    <Tabs defaultValue='basic' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='basic'>Informações Básicas</TabsTrigger>
        <TabsTrigger value='location'>Localização</TabsTrigger>
      </TabsList>
      <TabsContent value='basic' className='mt-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {basicFilters.map(renderFilterItem)}
        </div>
      </TabsContent>
      <TabsContent value='location' className='mt-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {locationFilters.map(renderFilterItem)}
        </div>
      </TabsContent>
    </Tabs>
  )
}
