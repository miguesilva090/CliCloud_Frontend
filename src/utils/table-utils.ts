import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { VisibilityState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useWindowPageState } from '@/stores/use-pages-store'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { useCurrentWindowId, generateInstanceId } from '@/utils/window-utils'
import { DataTableFilterField } from '@/components/shared/data-table-types'

export const getColumnHeader = <T>(
  column: ColumnDef<T, unknown>,
  filterFields: DataTableFilterField<T>[]
): string => {
  // First check if there's a matching filter field
  if ('accessorKey' in column) {
    const filterField = filterFields.find(
      (field) => field.value === column.accessorKey
    )
    if (filterField) return filterField.label
  }

  // Fallback to existing logic
  if (typeof column.header === 'string') return column.header
  if ('accessorKey' in column) return column.accessorKey.toString()
  return ''
}

export type TableState = {
  filters: Array<{ id: string; value: string }>
  sorting: Array<{ id: string; desc: boolean }>
  pagination: { page: number; pageSize: number }
  columnVisibility: VisibilityState
  selectedRows: string[]
}

export type TableHandlers = {
  handleFiltersChange: (filters: Array<{ id: string; value: string }>) => void
  handlePaginationChange: (page: number, pageSize: number) => void
  handleSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void
  handleRowSelectionChange: (newSelectedRows: string[]) => void
  handleColumnVisibilityChange: (
    updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)
  ) => void
  handleCreateClick: (basePath: string) => void
}

export function useTableState(
  onFiltersChange?: (filters: Array<{ id: string; value: string }>) => void,
  onPaginationChange?: (page: number, pageSize: number) => void,
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void
): { state: TableState; handlers: TableHandlers; activeFiltersCount: number } {
  const currentWindowId = useCurrentWindowId()
  const navigate = useNavigate()
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const {
    filters,
    sorting,
    pagination: { page, pageSize },
    columnVisibility,
    setColumnVisibility,
    selectedRows = [],
    setSelectedRows,
  } = useWindowPageState(currentWindowId)

  // Update active filters count when filters or window changes
  useEffect(() => {
    const count = filters.filter((filter) => filter.value).length
    setActiveFiltersCount(count)
  }, [filters, currentWindowId])

  const handleFiltersChange = (
    filters: Array<{ id: string; value: string }>
  ) => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    if (onPaginationChange) {
      onPaginationChange(page, pageSize)
    }
  }

  const handleSortingChange = (
    sorting: Array<{ id: string; desc: boolean }>
  ) => {
    if (onSortingChange) {
      onSortingChange(sorting)
    }
  }

  const handleRowSelectionChange = (newSelectedRows: string[]) => {
    setSelectedRows(newSelectedRows)
  }

  const handleColumnVisibilityChange = (
    updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)
  ) => {
    const newVisibility =
      typeof updater === 'function' ? updater(columnVisibility) : updater
    setColumnVisibility(newVisibility)
  }

  const handleCreateClick = (basePath: string) => {
    const instanceId = generateInstanceId()
    navigate(`${basePath}/create?instanceId=${instanceId}`)
  }

  return {
    state: {
      filters,
      sorting,
      pagination: { page, pageSize },
      columnVisibility,
      selectedRows,
    },
    handlers: {
      handleFiltersChange,
      handlePaginationChange,
      handleSortingChange,
      handleRowSelectionChange,
      handleColumnVisibilityChange,
      handleCreateClick,
    },
    activeFiltersCount,
  }
}

export function useDeleteHandler(
  mutation: any,
  successMessage: string,
  errorMessage: string,
  selectedRows: string[] = [],
  onSuccess?: () => void,
  partialSuccessMessage?: string,
  onSelectedRowsUpdate?: (deletedIds: string[]) => void
) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleDeleteSelected = async () => {
    if (!selectedRows.length) return

    try {
      const response = await mutation.mutateAsync(selectedRows)

      // Use the new response handling system
      const result = handleApiResponse(
        response,
        successMessage,
        errorMessage,
        partialSuccessMessage || 'Operação concluída com avisos'
      )

      if (result.success) {
        // For partial success, we need to determine which items were actually deleted
        if (result.isPartialSuccess && response.info?.messages) {
          // Extract successfully deleted IDs from the response
          // The API should return information about which items were deleted
          const deletedIds = extractDeletedIds(response, selectedRows)
          onSelectedRowsUpdate?.(deletedIds)
        } else {
          // Full success - all selected items were deleted
          onSelectedRowsUpdate?.(selectedRows)
        }

        onSuccess?.()
      }
    } catch (error) {
      // Fallback for errors that don't go through the response handler
      toast.error(errorMessage)
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteSelected,
  }
}

// Helper function to extract deleted IDs from the response
function extractDeletedIds(response: any, selectedRows: string[]): string[] {
  // The API returns an array of successfully deleted IDs in the data field
  if (response.info?.data && Array.isArray(response.info.data)) {
    // Return the IDs that were successfully deleted
    return response.info.data
  }

  // If no data array, assume all were deleted (full success)
  return selectedRows
}

/**
 * Hook for managing filter state that supports both column-based and non-column filters.
 * This allows filters to be defined in filterFields even if they don't have corresponding columns.
 *
 * @param table - The react-table instance
 * @param filters - Array of filters from the store
 * @returns Object with filterValues state and handleFilterChange function
 */
export function useFilterState(
  table: any,
  filters: Array<{ id: string; value: string }>
) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  // Initialize filters from store
  useEffect(() => {
    const newFilterValues: Record<string, string> = {}

    filters.forEach((filter) => {
      newFilterValues[filter.id] = filter.value
      const column = table.getColumn(filter.id)
      if (column) {
        column.setFilterValue(filter.value)
      } else {
        // For non-column filters, manually set them in the table state
        const currentFilters = table.getState().columnFilters || []
        const existingFilterIndex = currentFilters.findIndex(
          (f: { id: string; value: string }) => f.id === filter.id
        )

        if (existingFilterIndex >= 0) {
          const newFilters = [...currentFilters]
          newFilters[existingFilterIndex] = {
            id: filter.id,
            value: filter.value,
          }
          table.setColumnFilters(newFilters)
        } else if (filter.value) {
          table.setColumnFilters([
            ...currentFilters,
            { id: filter.id, value: filter.value },
          ])
        }
      }
    })

    setFilterValues(newFilterValues)
  }, [filters, table])

  const handleFilterChange = (columnId: string, value: string) => {
    const newValue = value === 'all' ? '' : value

    // Update local state
    setFilterValues((prev) => ({
      ...prev,
      [columnId]: newValue,
    }))

    // Update the table's pendingColumnFilters
    // For non-column filters, we still need to set them in the table state
    // so they get passed to onFiltersChange
    const column = table.getColumn(columnId)
    if (column) {
      column.setFilterValue(newValue)
    } else {
      // For filters without columns, manually update the pending filters
      const currentFilters = table.getState().columnFilters || []
      const existingFilterIndex = currentFilters.findIndex(
        (f: { id: string; value: string }) => f.id === columnId
      )

      if (existingFilterIndex >= 0) {
        // Update existing filter
        const newFilters = [...currentFilters]
        newFilters[existingFilterIndex] = {
          id: columnId,
          value: newValue,
        }
        table.setColumnFilters(newFilters)
      } else if (newValue) {
        // Add new filter if value is not empty
        table.setColumnFilters([
          ...currentFilters,
          { id: columnId, value: newValue },
        ])
      } else {
        // Remove filter if value is empty
        table.setColumnFilters(
          currentFilters.filter(
            (f: { id: string; value: string }) => f.id !== columnId
          )
        )
      }
    }
  }

  return {
    filterValues,
    handleFilterChange,
  }
}

/**
 * Separates filter fields into column-based and non-column filters.
 * This is useful for rendering filters that don't have corresponding table columns.
 *
 * @param columns - Array of column definitions
 * @param filterFields - Array of filter field definitions
 * @returns Object with columnBasedFilters and nonColumnFilters arrays
 */
export function separateColumnAndNonColumnFilters<TData>(
  columns: ColumnDef<TData, any>[],
  filterFields: DataTableFilterField<TData>[]
) {
  // Get all filter fields that have matching columns
  const columnBasedFilters = columns
    .filter(
      (column) =>
        'accessorKey' in column &&
        column.accessorKey &&
        filterFields.some((field) => field.value === column.accessorKey)
    )
    .sort((a, b) => {
      const aField = filterFields.find(
        (field) => 'accessorKey' in a && field.value === (a as any).accessorKey
      )
      const bField = filterFields.find(
        (field) => 'accessorKey' in b && field.value === (b as any).accessorKey
      )
      return (aField?.order ?? Infinity) - (bField?.order ?? Infinity)
    })

  // Get filter fields that don't have matching columns
  const nonColumnFilters = filterFields.filter(
    (field) =>
      !columns.some(
        (column) =>
          'accessorKey' in column && column.accessorKey === field.value
      )
  )

  return {
    columnBasedFilters,
    nonColumnFilters,
  }
}

/**
 * Converts an array of filters to a Record<string, string> format
 * for API requests that expect filters as an object.
 *
 * @param filters - Array of filter objects with id and value
 * @returns Record<string, string> or undefined if filters is null/empty
 *
 * @example
 * convertFiltersToRecord([
 *   { id: 'entityId', value: 'guid-123' },
 *   { id: 'dataTransferencia', value: '2024-01-15' }
 * ])
 * // Returns: { entityId: 'guid-123', dataTransferencia: '2024-01-15' }
 */
export function convertFiltersToRecord(
  filters: Array<{ id: string; value: string }> | null
): Record<string, string> | undefined {
  if (!filters || filters.length === 0) {
    return undefined
  }

  const result: Record<string, string> = {}
  for (const filter of filters) {
    if (filter.value && filter.value.trim() !== '') {
      result[filter.id] = filter.value
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}
