import React, { useState, useEffect } from 'react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  VisibilityState,
  Updater,
} from '@tanstack/react-table'
import { PrintOption } from '@/types/data-table'
import { ArrowUpDown, ArrowRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableFilterModal } from '@/components/shared/data-table-filter-modal'
import {
  DataTableFilterField,
  DataTableColumnDef,
} from '@/components/shared/data-table-types'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { DataTableToolbar } from './data-table-toolbar'

export type DataTableAction = {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'emerald'
  disabled?: boolean
  showOnlyIcon?: boolean
  className?: string
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  filterFields?: DataTableFilterField<TData>[]
  pageSizeOptions?: number[]
  initialFilters?: ColumnFiltersState
  initialActiveFiltersCount?: number
  onPaginationChange?: (page: number, pageSize: number) => void
  onFiltersChange?: (filters: Array<{ id: string; value: string }>) => void
  FilterControls: React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
  }>
  baseRoute?: string
  hiddenColumns?: string[]
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void
  enableSorting?: boolean
  selectedRows?: string[]
  onRowSelectionChange?: (selectedRows: string[]) => void
  printOptions?: PrintOption[]
  totalRows?: number
  toolbarActions?: DataTableAction[]
  initialPage?: number
  initialPageSize?: number
  initialSorting?: Array<{ id: string; desc: boolean }>
  initialColumnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
  isLoading?: boolean
  /** Exibir pesquisa expansível: botão "Pesquisa" que abre painel por datas/código; campo nome sempre visível */
  expandableSearch?: boolean
  /** Coluna à qual aplicar o valor do campo "Procurar por nome" (ex.: 'nomeUtente') */
  globalSearchColumnId?: string
  /** Placeholder do campo de pesquisa por nome */
  globalSearchPlaceholder?: string
  /** Esconder Filtros/Pesquisa na toolbar (ex.: Consultas Marcadas – filtro só por calendário) */
  hideToolbarFilters?: boolean
  /** Esconder a toolbar inteira (ex.: Exames Sem Papel – toolbar custom na página) */
  hideToolbar?: boolean
}

// Textos da paginação (apenas abaixo da tabela, estilo unificado)
const ptPTTranslations = {
  mostrar: 'Mostrar',
  registos: 'registos',
  of: 'de',
  page: 'Página',
  noResults: 'Sem resultados.',
  encontrados: 'Encontrados',
  rowsSelected: 'linha(s) selecionada(s).',
  goToFirstPage: 'Ir para primeira página',
  goToPreviousPage: 'Ir para página anterior',
  goToNextPage: 'Ir para próxima página',
  goToLastPage: 'Ir para última página',
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
  initialFilters = [],
  initialActiveFiltersCount,
  onPaginationChange,
  onFiltersChange,
  FilterControls,
  baseRoute,
  hiddenColumns,
  onSortingChange,
  selectedRows,
  onRowSelectionChange,
  printOptions,
  totalRows,
  toolbarActions,
  initialPage = 1,
  initialPageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
  onColumnVisibilityChange,
  isLoading = false,
  expandableSearch = false,
  globalSearchColumnId,
  globalSearchPlaceholder = 'Procurar por nome utente...',
  hideToolbarFilters = false,
  hideToolbar = false,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(initialPage - 1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialFilters)
  const [pendingColumnFilters, setPendingColumnFilters] =
    useState<ColumnFiltersState>(initialFilters)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  // Valor da pesquisa global derivado dos filtros (fonte de verdade no pai) para evitar
  // condição de corrida em que o re-render do pai apaga o texto ao digitar (ex.: médicos).
  const globalSearchValue =
    globalSearchColumnId != null
      ? (initialFilters.find((f) => f.id === globalSearchColumnId)?.value as string) ?? ''
      : ''
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  )
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  // Fechar modal de filtros quando a rota mudar para não bloquear navegação/foco
  useEffect(() => {
    setIsFilterModalOpen(false)
  }, [location.pathname])

  // Se o utilizador navegar para outra rota enquanto existe pesquisa global,
  // limpar automaticamente esse filtro para não "transportar" a pesquisa.
  useEffect(() => {
    if (!globalSearchColumnId) return

    setPendingColumnFilters((prev) => {
      const hasGlobal = prev.some(
        (f) => f.id === globalSearchColumnId && f.value
      )
      if (!hasGlobal) return prev

      const next = prev.filter((f) => f.id !== globalSearchColumnId)
      setColumnFilters(next)

      if (onFiltersChange) {
        const formattedFilters = next
          .filter((filter) => filter.value)
          .map((filter) => ({
            id: filter.id,
            value: filter.value as string,
          }))
        onFiltersChange(formattedFilters)
      }

      return next
    })
  }, [location.pathname, globalSearchColumnId])

  useEffect(() => {
    if (hiddenColumns) {
      setColumnVisibility(
        hiddenColumns.reduce(
          (acc, columnId) => ({
            ...acc,
            [columnId]: false,
          }),
          {}
        )
      )
    }
  }, [hiddenColumns])

  // Sincronizar estado interno com a rota/URL sempre que os valores iniciais mudam
  // (evita que, após interação com filtros/sorting/paginação, a tabela ignore mudanças vindas da rota)
  useEffect(() => {
    setPageIndex(initialPage - 1)
  }, [initialPage])

  useEffect(() => {
    setPageSize(initialPageSize)
  }, [initialPageSize])

  useEffect(() => {
    setSorting(initialSorting)
  }, [initialSorting])

  // Dependência por valor (JSON) para não re-sincronizar quando o pai passa novo array com os mesmos valores
  const initialFiltersKey = JSON.stringify(initialFilters)
  useEffect(() => {
    setColumnFilters(initialFilters)
    setPendingColumnFilters(initialFilters)
  }, [initialFiltersKey])

  useEffect(() => {
    if (initialActiveFiltersCount !== undefined) {
      setActiveFiltersCount(initialActiveFiltersCount)
    }
  }, [initialActiveFiltersCount])

  useEffect(() => {
    const count = columnFilters.filter((filter) => filter.value).length
    setActiveFiltersCount(count)
  }, [columnFilters])

  const handlePaginationChange = (
    newPageIndex: number,
    newPageSize: number
  ) => {
    if (onPaginationChange) {
      onPaginationChange(newPageIndex + 1, newPageSize)
    }
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  const handleApplyFilters = (nextFilters?: ColumnFiltersState) => {
    const filtersToApply = nextFilters ?? pendingColumnFilters
    setColumnFilters(filtersToApply)
    if (onFiltersChange) {
      const formattedFilters = filtersToApply
        .filter((filter) => filter.value)
        .map((filter) => ({
          id: filter.id,
          value: filter.value as string,
        }))
      onFiltersChange(formattedFilters)
    }
    setIsFilterModalOpen(false)
  }

  const handleClearFilters = () => {
    setPendingColumnFilters([])
    setColumnFilters([])
    setPageIndex(0)
    if (onFiltersChange) {
      onFiltersChange([])
    }
    if (onPaginationChange) {
      onPaginationChange(1, pageSize)
    }
    if (baseRoute) {
      navigate(baseRoute)
    }
    setIsFilterModalOpen(false)
  }

  const handleColumnVisibilityChange = (
    updaterOrValue: Updater<VisibilityState>
  ) => {
    const updatedVisibility =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnVisibility)
        : updaterOrValue
    setColumnVisibility(updatedVisibility)
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(updatedVisibility)
    }
  }

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination: { pageIndex, pageSize },
      columnFilters: pendingColumnFilters,
      columnVisibility,
      sorting,
      // TanStack Table espera sempre um objeto aqui (nunca `undefined`)
      rowSelection: (selectedRows ?? []).reduce(
        (acc, id) => ({
          ...acc,
          [id]: true,
        }),
        {} as Record<string, boolean>
      ),
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    getRowId: (row: any, index: number) =>
      row?.id != null ? String(row.id) : `row-${index}`,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      if (typeof updater === 'function') {
        const currentSelection = table.getState().rowSelection ?? {}
        const newSelection = updater(currentSelection)
        const selectedIds = Object.entries(newSelection)
          .filter(([_, selected]) => selected)
          .map(([id]) => id)
        onRowSelectionChange?.(selectedIds)
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        })
        handlePaginationChange(newState.pageIndex, newState.pageSize)
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        const newSorting = updater(sorting)
        setSorting(newSorting)
        if (onSortingChange) {
          onSortingChange(
            newSorting.map((sort) => ({
              id: sort.id,
              desc: sort.desc,
            }))
          )
        }
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        const newFilters = updater(pendingColumnFilters)
        setPendingColumnFilters(newFilters)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Com manualPagination (server-side), os dados já vêm paginados – mostrar todos; sem slice por pageSize
    getPaginationRowModel: (table: any) => () =>
      table.options.manualPagination
        ? table.getSortedRowModel()
        : getPaginationRowModel()(table),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  // Sincronizar visibilidade de colunas com props (uma única fonte de verdade)
  useEffect(() => {
    setColumnVisibility(initialColumnVisibility)
    table.setColumnVisibility(initialColumnVisibility)
  }, [initialColumnVisibility, table])

  const getActiveFiltersCount = () => {
    return activeFiltersCount
  }

  return (
    <div className='flex flex-col space-y-4'>
      {!hideToolbar && (
        <DataTableToolbar
          onFilterClick={() => setIsFilterModalOpen(true)}
          activeFiltersCount={getActiveFiltersCount()}
          printOptions={printOptions}
          toolbarActions={toolbarActions}
          expandableSearch={expandableSearch}
          searchExpanded={isSearchExpanded}
          onSearchExpandToggle={() => setIsSearchExpanded((v) => !v)}
          globalSearchValue={globalSearchValue}
          onGlobalSearchChange={(value) => {
            if (!globalSearchColumnId) return

            const column = table.getColumn(globalSearchColumnId)

            if (value === '') {
              // Limpar pesquisa global: remover filtro e voltar a mostrar todos
              column?.setFilterValue(undefined)
              const next = pendingColumnFilters.filter(
                (f) => f.id !== globalSearchColumnId
              )
              setPendingColumnFilters(next)
              handleApplyFilters(next)
              return
            }

            column?.setFilterValue(value)
            const rest = pendingColumnFilters.filter(
              (f) => f.id !== globalSearchColumnId
            )
            const next = [...rest, { id: globalSearchColumnId, value }]
            setPendingColumnFilters(next)
            handleApplyFilters(next)
          }}
          globalSearchPlaceholder={globalSearchPlaceholder}
          hideToolbarFilters={hideToolbarFilters}
        />
      )}

      {expandableSearch && isSearchExpanded && (
        <div className='rounded-md border bg-muted/60 p-4'>
          <div className='flex gap-4 items-start'>
            <div className='flex-1 min-w-0'>
              <FilterControls
                table={table}
                columns={columns}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
            <div className='flex flex-col gap-2 shrink-0'>
              <Button
                variant='destructive'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearFilters()
                }}
              >
                Limpar Dados
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  handleApplyFilters()
                }}
              >
                <ArrowRight className='h-4 w-4 mr-1.5' />
                Pesquisar
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTableFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        table={table}
        columns={columns}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        FilterControls={FilterControls}
      />

      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='relative flex-1 rounded-md border bg-muted/60 p-2'>
          {isLoading && (
            <div
              className='absolute inset-0 z-50 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm pointer-events-none'
              aria-hidden
            >
              <LoadingSpinner
                size='sm'
                title='A filtrar...'
                description='Por favor aguarde'
              />
            </div>
          )}
          <ScrollArea className='h-[calc(100vh-500px)] rounded-md border md:h-[calc(100vh-400px)]'>
            <div>
              <Table key={JSON.stringify(columnVisibility)}>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='hover:bg-muted'>
                      {headerGroup.headers
                        .filter((header) => header.column.getIsVisible())
                        .map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'h-12 font-semibold text-muted-foreground hover:text-foreground',
                            (
                              header.column
                                .columnDef as DataTableColumnDef<TData>
                            ).meta?.align === 'center' && 'text-center',
                            (
                              header.column
                                .columnDef as DataTableColumnDef<TData>
                            ).meta?.align === 'right' && 'text-right',
                            (
                              header.column
                                .columnDef as DataTableColumnDef<TData>
                            ).meta?.align === 'left' && 'text-left'
                          )}
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className={cn(
                                    'flex items-center gap-2 cursor-pointer select-none',
                                    (
                                      header.column
                                        .columnDef as DataTableColumnDef<TData>
                                    ).meta?.align === 'center' &&
                                      'justify-center',
                                    (
                                      header.column
                                        .columnDef as DataTableColumnDef<TData>
                                    ).meta?.align === 'right' && 'justify-end'
                                  )}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  <div className='w-4'>
                                    {header.column.getIsSorted() === 'asc' && (
                                      <ArrowUpIcon className='h-4 w-4' />
                                    )}
                                    {header.column.getIsSorted() === 'desc' && (
                                      <ArrowDownIcon className='h-4 w-4' />
                                    )}
                                    {!header.column.getIsSorted() && (
                                      <ArrowUpDown className='h-4 w-4 opacity-50' />
                                    )}
                                  </div>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='start'>
                                <DropdownMenuItem
                                  onClick={() =>
                                    header.column.toggleSorting(false)
                                  }
                                  className='gap-2'
                                >
                                  <ArrowUpIcon className='h-3.5 w-3.5' />
                                  Asc
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    header.column.toggleSorting(true)
                                  }
                                  className='gap-2'
                                >
                                  <ArrowDownIcon className='h-3.5 w-3.5' />
                                  Desc
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div
                              className={cn(
                                'flex items-center gap-2',
                                (
                                  header.column
                                    .columnDef as DataTableColumnDef<TData>
                                ).meta?.align === 'center' && 'justify-center',
                                (
                                  header.column
                                    .columnDef as DataTableColumnDef<TData>
                                ).meta?.align === 'right' && 'justify-end'
                              )}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(
                          (baseRoute || onRowSelectionChange) && 'cursor-pointer',
                          row.getIsSelected() &&
                            'bg-primary/60 hover:bg-primary/70 text-primary-foreground'
                        )}
                        onClick={(e) => {
                          const target = e.target as HTMLElement | null
                          if (
                            target?.closest(
                              'a,button,[role="button"],[role="checkbox"],input,select,textarea'
                            )
                          ) {
                            return
                          }
                          if (baseRoute && row.id != null && row.id !== '') {
                            if (e.defaultPrevented) return
                            const path = `${baseRoute.replace(/\/$/, '')}/${row.id}`
                            navigate(path)
                            return
                          }
                          if (!baseRoute && onRowSelectionChange) {
                            const id = String(row.id)
                            const wasSelected = (selectedRows ?? []).includes(id)
                            const nextSelection = wasSelected ? [] : [id]
                            onRowSelectionChange(nextSelection)
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              (
                                cell.column
                                  .columnDef as DataTableColumnDef<TData>
                              ).meta?.width,
                              (
                                cell.column
                                  .columnDef as DataTableColumnDef<TData>
                              ).meta?.align === 'center' && 'text-center',
                              (
                                cell.column
                                  .columnDef as DataTableColumnDef<TData>
                              ).meta?.align === 'right' && 'text-right',
                              (
                                cell.column
                                  .columnDef as DataTableColumnDef<TData>
                              ).meta?.align === 'left' && 'text-left'
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='h-24 text-center'
                      >
                        {ptPTTranslations.noResults}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          {/* Paginação apenas abaixo da tabela: Mostrar X registos, Página X de N, Encontrados X registos */}
          <div className='mt-2 flex flex-wrap items-center gap-4 py-4 text-sm text-muted-foreground sm:flex-row'>
            <span className='flex items-center gap-2'>
              {ptPTTranslations.mostrar}
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value: string) => {
                  const newSize = Number(value)
                  table.setPageSize(newSize)
                }}
              >
                <SelectTrigger className='h-8 w-[5rem]'>
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side='top'>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ptPTTranslations.registos}
            </span>
            <span className='flex items-center gap-1'>
              {ptPTTranslations.page}{' '}
              {table.getState().pagination.pageIndex + 1} {ptPTTranslations.of}{' '}
              {table.getPageCount()}
            </span>
            <span>
              {ptPTTranslations.encontrados}{' '}
              {totalRows ?? table.getFilteredRowModel().rows.length} {ptPTTranslations.registos}
            </span>
            <div className='flex items-center space-x-2'>
                <Button
                  aria-label={ptPTTranslations.goToFirstPage}
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <DoubleArrowLeftIcon className='h-4 w-4' aria-hidden='true' />
                </Button>
                <Button
                  aria-label={ptPTTranslations.goToPreviousPage}
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
                </Button>
                <Button
                  aria-label={ptPTTranslations.goToNextPage}
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
                </Button>
                <Button
                  aria-label={ptPTTranslations.goToLastPage}
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <DoubleArrowRightIcon
                    className='h-4 w-4'
                    aria-hidden='true'
                  />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
