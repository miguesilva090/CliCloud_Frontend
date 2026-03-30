import { ColumnDef } from '@tanstack/react-table'
import { filterFields } from '@/pages/base/distritos/components/distritos-table/distritos-constants'
import { useGetPaisesSelect } from '@/pages/base/paises/queries/paises-queries'
import { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'
import { useWindowPageState } from '@/stores/use-pages-store'
import {
  getColumnHeader,
  useFilterState,
  separateColumnAndNonColumnFilters,
} from '@/utils/table-utils'
import { useCurrentWindowId } from '@/utils/window-utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BaseFilterControlsProps } from '@/components/shared/data-table-filter-controls-base'

export function DistritosFilterControls({
  table,
  columns,
}: BaseFilterControlsProps<DistritoTableDTO>) {
  const windowId = useCurrentWindowId()
  const { filters } = useWindowPageState(windowId)
  const { filterValues, handleFilterChange } = useFilterState(table, filters)
  const { data: paisesData } = useGetPaisesSelect()

  const renderFilterInput = (column: ColumnDef<DistritoTableDTO, unknown>) => {
    if (!('accessorKey' in column) || !column.accessorKey) return null

    const columnId = column.accessorKey.toString()
    const commonInputStyles =
      'w-full justify-start px-4 py-6 text-left font-normal shadow-inner'

    if (columnId === 'paisId') {
      const currentValue = filterValues[columnId] ?? ''
      return (
        <Select
          value={currentValue === '' ? 'all' : currentValue}
          onValueChange={(value) => handleFilterChange(columnId, value)}
        >
          <SelectTrigger className={commonInputStyles}>
            <SelectValue placeholder='Selecione um país' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas</SelectItem>
            {paisesData?.map((pais) => (
              <SelectItem key={pais.id} value={pais.id || ''}>
                {pais.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

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
    return fieldId.includes('pais')
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

      if (fieldId === 'paisId') {
        const currentValue = filterValues[fieldId] ?? ''
        return (
          <div key={fieldId} className='space-y-2'>
            <Label className='text-xs font-medium'>{fieldLabel}</Label>
            <Select
              value={currentValue === '' ? 'all' : currentValue}
              onValueChange={(value) =>
                handleFilterChange(fieldId, value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className={commonInputStyles}>
                <SelectValue placeholder='Selecione um país' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                {paisesData?.map((pais) => (
                  <SelectItem key={pais.id} value={pais.id || ''}>
                    {pais.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

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
