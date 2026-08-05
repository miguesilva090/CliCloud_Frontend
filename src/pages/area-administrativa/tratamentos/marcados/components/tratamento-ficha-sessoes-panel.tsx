import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SessaoTratamentoService } from '@/lib/services/tratamentos/sessao-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { SessaoTratamentoTableDTO } from '@/types/dtos/tratamentos/sessao-tratamento.dtos'
import { SessaoTratamentoFichaModal } from '../modals/sessao-tratamento-ficha-modal'
import { CompensarFaltaSessaoModal } from '../modals/compensar-falta-sessao-modal'

function fmtDate(v?: string | null) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-PT')
}

function bitCell(v?: number | null) {
  return v === 1 ? 'Sim' : 'Não'
}

const EmptyFilterControls = () => null

type Props = {
  tratamentoId: string
  listPermId: string
  canView: boolean
  canChange: boolean
  canDelete: boolean
  sessoes: SessaoTratamentoTableDTO[]
  isLoading: boolean
  onRefresh: () => void
  defaultFisioId?: string
  defaultFisioLabel?: string
  defaultAuxId?: string
  defaultAuxLabel?: string
  defaultOutroId?: string
  defaultOutroLabel?: string
  defaultDuracao?: string
  defaultUTempoFisio?: number
  defaultUTempoAux?: number
  defaultUTempoOutro?: number
}

export function TratamentoFichaSessoesPanel({
  tratamentoId,
  listPermId,
  canView,
  canChange,
  canDelete,
  sessoes,
  isLoading,
  onRefresh,
  defaultFisioId,
  defaultFisioLabel,
  defaultAuxId,
  defaultAuxLabel,
  defaultOutroId,
  defaultOutroLabel,
  defaultDuracao,
  defaultUTempoFisio,
  defaultUTempoAux,
  defaultUTempoOutro,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create'
  )
  const [row, setRow] = useState<SessaoTratamentoTableDTO | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [compensarAskOpen, setCompensarAskOpen] = useState(false)
  const [compensarModalOpen, setCompensarModalOpen] = useState(false)

  const canCompensar = useMemo(() => {
    const faltas = sessoes.filter((s) => s.faltou === 1).length
    const comps = sessoes.filter((s) => s.compensaFalta === 1).length
    return faltas > comps
  }, [sessoes])

  const columns = useMemo((): DataTableColumnDef<SessaoTratamentoTableDTO>[] => {
    const base: DataTableColumnDef<SessaoTratamentoTableDTO>[] = [
      {
        accessorKey: 'numSessao',
        header: 'N.º',
        enableSorting: false,
        cell: ({ row: r }) => r.original.numSessao ?? '—',
      },
      {
        accessorKey: 'data',
        header: 'Data',
        enableSorting: false,
        cell: ({ row: r }) => fmtDate(r.original.data),
      },
      {
        accessorKey: 'horaInic',
        header: 'Início',
        enableSorting: false,
        cell: ({ row: r }) => r.original.horaInic?.trim() || '—',
      },
      {
        accessorKey: 'duracao',
        header: 'Duração',
        enableSorting: false,
        cell: ({ row: r }) => r.original.duracao?.trim() || '—',
      },
      {
        accessorKey: 'confirmado',
        header: 'Confirmado',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.confirmado),
      },
      {
        accessorKey: 'efetuado',
        header: 'Efectuado',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.efetuado),
      },
      {
        accessorKey: 'faltou',
        header: 'Faltou',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.faltou),
      },
      {
        accessorKey: 'compensaFalta',
        header: 'Compensa',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.compensaFalta),
      },
      {
        accessorKey: 'desmarcado',
        header: 'Desmarcado',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.desmarcado),
      },
      {
        accessorKey: 'pago',
        header: 'Pago',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.pago),
      },
    ]

    return [
      ...base,
      createAreaComumListActionsColumnDef<SessaoTratamentoTableDTO>({
        onOpenView: (data) => {
          setRow(data)
          setModalMode('view')
          setModalOpen(true)
        },
        onOpenEdit: canChange
          ? (data) => {
              setRow(data)
              setModalMode('edit')
              setModalOpen(true)
            }
          : undefined,
        onOpenDelete: canDelete
          ? (data) => {
              setRow(data)
              setDeleteOpen(true)
            }
          : undefined,
        rowActionPermissions: { canView, canChange, canDelete },
        isRowActionsLocked: (data) =>
          data.pago === 1 || data.faturado === 1,
      }),
    ]
  }, [canView, canChange, canDelete])

  const handleConfirmDelete = async () => {
    if (!row) return
    setDeleting(true)
    try {
      const res = await SessaoTratamentoService(listPermId).delete(row.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Sessão eliminada.')
        setDeleteOpen(false)
        setRow(null)
        onRefresh()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível eliminar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao eliminar.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='space-y-3'>
      {canChange ? (
        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            variant='secondary'
            disabled={!canCompensar}
            onClick={() => setCompensarModalOpen(true)}
          >
            Compensar falta
          </Button>
          <Button
            type='button'
            size='sm'
            className='gap-2'
            onClick={() => {
              setRow(null)
              setModalMode('create')
              setModalOpen(true)
            }}
          >
            <Plus className='h-4 w-4' />
            Nova sessão
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={sessoes}
        isLoading={isLoading}
        pageCount={1}
        totalRows={sessoes.length}
        initialPage={1}
        initialPageSize={50}
        FilterControls={EmptyFilterControls}
        hideToolbarFilters
        onPaginationChange={() => undefined}
        onFiltersChange={() => undefined}
        onSortingChange={() => undefined}
      />

      <SessaoTratamentoFichaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        tratamentoId={tratamentoId}
        listPermId={listPermId}
        existingSessoes={sessoes}
        row={row}
        onSaved={(ctx) => {
          onRefresh()
          if (ctx?.offerCompensar) setCompensarAskOpen(true)
        }}
        defaultFisioId={defaultFisioId}
        defaultFisioLabel={defaultFisioLabel}
        defaultAuxId={defaultAuxId}
        defaultAuxLabel={defaultAuxLabel}
        defaultOutroId={defaultOutroId}
        defaultOutroLabel={defaultOutroLabel}
      />

      <AlertDialog open={compensarAskOpen} onOpenChange={setCompensarAskOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja compensar esta falta?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCompensarAskOpen(false)
                setCompensarModalOpen(true)
              }}
            >
              Sim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CompensarFaltaSessaoModal
        open={compensarModalOpen}
        onOpenChange={setCompensarModalOpen}
        tratamentoId={tratamentoId}
        listPermId={listPermId}
        sessoes={sessoes}
        defaultFisioId={defaultFisioId}
        defaultFisioLabel={defaultFisioLabel}
        defaultAuxId={defaultAuxId}
        defaultAuxLabel={defaultAuxLabel}
        defaultOutroId={defaultOutroId}
        defaultOutroLabel={defaultOutroLabel}
        defaultDuracao={defaultDuracao}
        defaultUTempoFisio={defaultUTempoFisio}
        defaultUTempoAux={defaultUTempoAux}
        defaultUTempoOutro={defaultUTempoOutro}
        onSaved={onRefresh}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja realmente apagar a sessão?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
            >
              {deleting ? 'A apagar…' : 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
