import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { List, Plus, RotateCw } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { useLocation } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { useGetAllTiposConsulta } from '@/pages/area-comum/tabelas/consultas/tipos-consultas/queries/listagem-tipos-consulta-queries'
import type { ConsultaMarcadaRow } from '../types/consulta-marcada-types'
import { ConsultaMarcadaViewEditModal } from '../modals/consulta-marcada-view-edit-modal'
import { useConsultasDoDiaMarcacoes } from '../queries/consultas-do-dia-queries'
import type { TipoConsultaDTO } from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
import {
  createAreaComumListActionsColumnDef,
} from '@/components/shared/area-comum-list-actions-column'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export type { ConsultaMarcadaRow }

function normalizeSelectedDate(value: Date | null | undefined): Date | undefined {
  if (!value || !isValid(value)) return undefined
  return startOfDay(value)
}

const baseColumns: Array<
  ColumnDef<ConsultaMarcadaRow> & DataTableColumnDef<ConsultaMarcadaRow>
> = [
  {
    accessorKey: 'dataLabel',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.dataLabel ?? row.original.data ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'horaMarcacaoLabel',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.horaMarcacaoLabel ?? '—',
    meta: { align: 'left', width: 'w-[80px]' },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Nº Utente',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.utenteNumero ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Nome Utente',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left', width: 'w-[200px]' },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.organismoNome ?? row.original.organismoCodigo ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'statusConsultaLabel',
    header: 'Estado',
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) =>
      row.original.statusConsultaLabel ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
]

function getColumnsWithActions(
  onOpenView: (row: ConsultaMarcadaRow) => void,
  onOpenEdit: (row: ConsultaMarcadaRow) => void,
  onOpenDelete: (row: ConsultaMarcadaRow) => void,
  rowActionPermissions: {
    canView: boolean
    canChange: boolean
    canDelete: boolean
  },
): Array<ColumnDef<ConsultaMarcadaRow> & DataTableColumnDef<ConsultaMarcadaRow>> {
  return [
    ...baseColumns,
    {
      ...createAreaComumListActionsColumnDef<ConsultaMarcadaRow>({
        onOpenView: (data) => onOpenView(data),
        onOpenEdit: (data) => onOpenEdit(data),
        onOpenDelete: (data) => onOpenDelete(data),
        rowActionPermissions,
      }),
      meta: { align: 'right', width: 'w-[90px]' },
    },
  ]
}

function ListagemConsultasMarcadasFilterControls(_: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

export function ListagemConsultasMarcadasPage() {
  const location = useLocation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false)
  const [viewEditMode, setViewEditMode] = useState<'view' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<ConsultaMarcadaRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ConsultaMarcadaRow | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const consultasMarcadasPermissionId =
    modules.areaClinica.permissions.listagemConsultasMarcadas.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(consultasMarcadasPermissionId)
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const dateForApi = selectedDateStr || format(new Date(), 'yyyy-MM-dd')
  const { rows: consultasFiltradas, refetch, isFetching } = useConsultasDoDiaMarcacoes(
    dateForApi,
    { enabled: true },
  )
  const filters = selectedDateStr ? [{ id: 'data', value: selectedDateStr }] : []

  useEffect(() => {
    setIsDatePickerOpen(false)
  }, [location.pathname, location.search])

  const handleOpenView = useCallback((row: ConsultaMarcadaRow) => {
    setSelectedRow(row)
    setViewEditMode('view')
    setViewEditModalOpen(true)
  }, [])
  const handleOpenEdit = useCallback((row: ConsultaMarcadaRow) => {
    setSelectedRow(row)
    setViewEditMode('edit')
    setViewEditModalOpen(true)
  }, [])
  const handleOpenDelete = useCallback((row: ConsultaMarcadaRow) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }, [])
  const handleEditSuccess = () => {
    refetch()
  }
  const handleConfirmDelete = () => {
    if (!itemToDelete?.id) return
    setDeleteDialogOpen(false)
    setItemToDelete(null)
    refetch()
    toast.success('Marcação removida da lista.')
  }
  const handleRefresh = () => {
    setPage(1)
    refetch()
  }

  const columns = useMemo(
    () =>
      getColumnsWithActions(handleOpenView, handleOpenEdit, handleOpenDelete, {
        canView,
        canChange,
        canDelete,
      }),
    [handleOpenView, handleOpenEdit, handleOpenDelete, canView, canChange, canDelete],
  )

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [{
          label: 'Adicionar Consulta',
          icon: <Plus className='h-4 w-4' />,
          onClick: () => setDialogOpen(true),
          variant: 'destructive' as const,
          className:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        }]
      : []),
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: (
        <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
      ),
      onClick: handleRefresh,
      variant: 'outline',
      disabled: isFetching,
    },
  ]

  const totalRegistos = consultasFiltradas.length
  const totalPages = Math.max(1, Math.ceil(totalRegistos / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return consultasFiltradas.slice(start, start + pageSize)
  }, [consultasFiltradas, page, pageSize])

  const { data: tiposConsultaData } = useGetAllTiposConsulta()
  const tiposConsulta = (tiposConsultaData?.info?.data ?? []) as TipoConsultaDTO[]
  const [tipoConsultaId, setTipoConsultaId] = useState<string>('')

  const toolbarEndPrefix = (
    <div className='flex shrink-0 flex-wrap items-center gap-2'>
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className={cn('min-w-[200px] justify-start text-left font-normal')}
          >
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })
              : 'Todas as datas'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(normalizeSelectedDate(date))
              setIsDatePickerOpen(false)
            }}
            locale={pt}
          />
        </PopoverContent>
      </Popover>
      {selectedDate ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={() => setSelectedDate(undefined)}
        >
          Limpar data
        </Button>
      ) : null}
    </div>
  )

  return (
    <>
      <PageHead title='Listagem de Consultas Marcadas | Agenda | Área Clínica | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Listagem de Consultas Marcadas'>
          {canView ? (
            <ConsultaMarcadaViewEditModal
              open={viewEditModalOpen}
              onOpenChange={setViewEditModalOpen}
              mode={viewEditMode}
              rowData={selectedRow}
              onSuccess={handleEditSuccess}
            />
          ) : null}
          {canDelete ? (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setDeleteDialogOpen(false)
                  setItemToDelete(null)
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar marcação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem a certeza que pretende eliminar a marcação de{' '}
                    {itemToDelete?.utenteNome ?? ''}? Esta ação não pode ser revertida.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleConfirmDelete()
                    }}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {canAdd ? (
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) setTipoConsultaId('')
              }}
            >
            <DialogContent className='sm:max-w-lg'>
              <DialogHeader>
                <DialogTitle>Nova consulta</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='utente-list'>Utente</Label>
                  <Input id='utente-list' placeholder='Selecionar ou procurar utente' />
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='grid gap-2'>
                    <Label htmlFor='data-list'>Data</Label>
                    <Input id='data-list' type='date' placeholder='Data' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='hora-list'>Hora</Label>
                    <Input id='hora-list' type='time' placeholder='Hora' />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='tipo-list'>Tipo de consulta</Label>
                  <Select value={tipoConsultaId} onValueChange={setTipoConsultaId}>
                    <SelectTrigger id='tipo-list' className='w-full'>
                      <SelectValue placeholder='Selecionar tipo de consulta' />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposConsulta.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='observacoes-list'>Observações</Label>
                  <Input id='observacoes-list' placeholder='Observações (opcional)' />
                </div>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          ) : null}

          <DataTable
            columns={columns}
            data={paginatedRows}
            pageCount={totalPages}
            totalRows={totalRegistos}
            initialPage={page}
            initialPageSize={pageSize}
            initialFilters={filters}
            initialSorting={sorting}
            onPaginationChange={(newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
            onFiltersChange={() => {}}
            onSortingChange={(newSorting) => setSorting(newSorting)}
            FilterControls={ListagemConsultasMarcadasFilterControls}
            hideToolbarFilters
            toolbarEndPrefix={toolbarEndPrefix}
            toolbarActions={toolbarActions}
            isLoading={isFetching}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
