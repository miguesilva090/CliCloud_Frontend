import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Eye, Pencil, PlayCircle, RefreshCw, Trash2 } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
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
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { ConsultaMarcadaViewEditModal } from '@/pages/area-clinica/processo-clinico/agenda/modals/consulta-marcada-view-edit-modal'
import type { ConsultaMarcadaRow } from '@/pages/area-clinica/processo-clinico/agenda/types/consulta-marcada-types'
import { useConsultasDoDiaMarcacoes } from '@/pages/area-clinica/processo-clinico/agenda/queries/consultas-do-dia-queries'
import { ConsultaService } from '@/lib/services/consultas/consulta-service'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'

export type ConsultaDoDiaRow = ConsultaMarcadaRow

const baseColumns: Array<ColumnDef<ConsultaDoDiaRow> & DataTableColumnDef<ConsultaDoDiaRow>> = [
  {
    accessorKey: 'dataLabel',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.dataLabel ?? row.original.data ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'horaMarcacaoLabel',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.horaMarcacaoLabel ?? '—',
    meta: { align: 'left', width: 'w-[80px]' },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Nº Utente',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.utenteNumero ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Nome Utente',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left', width: 'w-[200px]' },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.organismoNome ?? row.original.organismoCodigo ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'statusConsultaLabel',
    header: 'Estado',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.statusConsultaLabel ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
]

function getColumnsWithActions(
  onIniciarConsulta: (row: ConsultaDoDiaRow) => void,
  onOpenView: (row: ConsultaDoDiaRow) => void,
  onOpenEdit: (row: ConsultaDoDiaRow) => void,
  onOpenDelete: (row: ConsultaDoDiaRow) => void
): Array<ColumnDef<ConsultaDoDiaRow> & DataTableColumnDef<ConsultaDoDiaRow>> {
  return [
    ...baseColumns,
    {
      id: 'acoes',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) => {
        const r = row.original
        const jaTemConsulta = !!r.consultaId
        const title = jaTemConsulta ? 'Abrir Ficha Clínica' : 'Iniciar Consulta'
        return (
          <div className='flex items-center justify-end gap-1'>
            <Button
              type='button'
              variant='default'
              size='icon'
              className='h-8 w-8'
              title={title}
              onClick={(e) => {
                e.stopPropagation()
                onIniciarConsulta(r)
              }}
            >
              <PlayCircle className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Ver'
              onClick={(e) => {
                e.stopPropagation()
                onOpenView(r)
              }}
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Editar'
              onClick={(e) => {
                e.stopPropagation()
                onOpenEdit(r)
              }}
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              title='Remover'
              onClick={(e) => {
                e.stopPropagation()
                onOpenDelete(r)
              }}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right', width: 'w-[180px]' },
    },
  ]
}

function ConsultasDoDiaFilterControls(_: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

export function ConsultasDoDiaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const { rows: consultasFiltradas, refetch, isFetching } = useConsultasDoDiaMarcacoes(
    selectedDateStr,
    { enabled: true }
  )

  const [viewEditModalOpen, setViewEditModalOpen] = useState(false)
  const [viewEditMode, setViewEditMode] = useState<'view' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<ConsultaDoDiaRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ConsultaDoDiaRow | null>(null)
  const [iniciarLoading, setIniciarLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])

  const goToFichaClinica = (utenteId: string, consultaId?: string) => {
    const base = `${window.location.origin}/area-clinica/processo-clinico/atendimento/ficha-clinica`
    const params = new URLSearchParams()
    if (utenteId) params.set('utenteId', utenteId)
    if (consultaId) params.set('consultaId', consultaId)
    const url = params.toString() ? `${base}?${params.toString()}` : base
    window.location.href = url
  }

  const handleIniciarConsulta = async (row: ConsultaDoDiaRow) => {
    if (!row?.id) return
    const jaTemConsulta = !!row.consultaId
    if (jaTemConsulta) {
      goToFichaClinica(row.utenteId ?? '', row.consultaId ?? undefined)
      return
    }
    setIniciarLoading(true)
    try {
      const res = await ConsultaService().createConsultaFromMarcacao(row.id)
      const status = res?.info?.status
      if (status !== 0 && status !== undefined) {
        const msgs = res?.info?.messages as Record<string, string[] | undefined> | undefined
        const firstMsg = msgs?.$?.[0] ?? (msgs && Object.values(msgs).flat()[0])
        toast.error(firstMsg ?? 'Erro ao iniciar consulta.')
        return
      }
      const consultaId = res?.info?.data
      toast.success('Consulta iniciada. A abrir Ficha Clínica…')
      refetch()
      goToFichaClinica(row.utenteId ?? '', consultaId ?? undefined)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao iniciar consulta.')
    } finally {
      setIniciarLoading(false)
    }
  }

  const handleOpenView = (row: ConsultaDoDiaRow) => {
    setSelectedRow(row)
    setViewEditMode('view')
    setViewEditModalOpen(true)
  }

  const handleOpenEdit = (row: ConsultaDoDiaRow) => {
    setSelectedRow(row)
    setViewEditMode('edit')
    setViewEditModalOpen(true)
  }

  const handleOpenDelete = (row: ConsultaDoDiaRow) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleEditSuccess = () => {
    refetch()
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setDeleteDialogOpen(false)
    const id = itemToDelete.id
    setItemToDelete(null)
    try {
      const res = await MarcacaoConsultaService().deleteMarcacaoConsulta(id)
      if (res?.info?.status !== 0 && res?.info?.status !== undefined) {
        toast.error(res?.info?.messages?.$?.[0] ?? 'Erro ao remover.')
        return
      }
      refetch()
      toast.success('Marcação removida.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover.')
    }
  }

  const handleRefresh = () => {
    setPage(1)
    refetch()
  }

  const columns = useMemo(
    () =>
      getColumnsWithActions(
        handleIniciarConsulta,
        handleOpenView,
        handleOpenEdit,
        handleOpenDelete
      ),
    [refetch]
  )

  const totalRegistos = consultasFiltradas.length
  const totalPages = Math.max(1, Math.ceil(totalRegistos / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return consultasFiltradas.slice(start, start + pageSize)
  }, [consultasFiltradas, page, pageSize])

  const filters: Array<{ id: string; value: string }> = []

  return (
    <>
      <PageHead title='Consultas do Dia | CliCloud' />
      <DashboardPageContainer>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <h1 className='text-2xl font-bold text-foreground'>Consultas do Dia</h1>
          <div className='flex items-center gap-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn('min-w-[200px] justify-start text-left font-normal')}
                >
                  {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant='outline'
              size='sm'
              className='h-8'
              onClick={handleRefresh}
              title='Atualizar'
              disabled={isFetching}
            >
              <RefreshCw className={cn('h-4 w-4 sm:mr-2', isFetching && 'animate-spin')} />
              <span className='hidden sm:inline'>Atualizar</span>
            </Button>
          </div>
        </div>

        <ConsultaMarcadaViewEditModal
          open={viewEditModalOpen}
          onOpenChange={setViewEditModalOpen}
          mode={viewEditMode}
          rowData={selectedRow}
          onSuccess={handleEditSuccess}
        />

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
              <AlertDialogTitle>Remover marcação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende remover a marcação de{' '}
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
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          FilterControls={ConsultasDoDiaFilterControls}
          hideToolbar
          isLoading={iniciarLoading}
        />
      </DashboardPageContainer>
    </>
  )
}
