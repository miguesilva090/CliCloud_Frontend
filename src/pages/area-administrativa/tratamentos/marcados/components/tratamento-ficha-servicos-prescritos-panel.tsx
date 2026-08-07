import { useMemo, useState , useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { TimeField } from '@/components/shared/time-field'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ServicoTratamentoService } from '@/lib/services/tratamentos/servico-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { ServicoTratamentoTableDTO } from '@/types/dtos/tratamentos/servico-tratamento.dtos'
import { ServicoTratamentoFichaModal } from '../modals/servico-tratamento-ficha-modal'

const EmptyFilterControls = () => null

function bitCell(v?: number | null) {
  return v === 1 ? 'Sim' : 'Não'
}

type Props = {
  tratamentoId: string
  listPermId: string
  canView: boolean
  canChange: boolean
  canDelete: boolean
  servicos: ServicoTratamentoTableDTO[]
  isLoading: boolean
  onRefresh: () => void
  nomePatologia: string
  onNomePatologiaChange: (v: string) => void
  duracaoTotal: string
  onDuracaoTotalChange: (v: string) => void
}

export function TratamentoFichaServicosPrescritosPanel({
  tratamentoId,
  listPermId,
  canView,
  canChange,
  canDelete,
  servicos,
  isLoading,
  onRefresh,
  nomePatologia,
  onNomePatologiaChange,
  duracaoTotal,
  onDuracaoTotalChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create'
  )
  const [row, setRow] = useState<ServicoTratamentoTableDTO | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [patSearch, setPatSearch] = useState('')
  const [debPat] = useDebounce(patSearch, 300)

  const patologiaQ = useQuery({
    queryKey: ['ficha-trat-patologia', debPat],
    queryFn: () => PatologiaService(listPermId).getPatologiasLight(debPat),
  })

  const patologiaItems = useMemo(() => {
    const list = (patologiaQ.data?.info?.data ?? []).map((p) => ({
      value: p.designacao,
      label: p.designacao,
    }))
    if (nomePatologia.trim() && !list.some((i) => i.value === nomePatologia)) {
      list.unshift({value: nomePatologia, label: nomePatologia})
    }
    return list 
  }, [patologiaQ.data, nomePatologia])

  const sorted = useMemo(
    () => [...servicos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [servicos]
  )

  const columns = useMemo((): DataTableColumnDef<ServicoTratamentoTableDTO>[] => {
    const base: DataTableColumnDef<ServicoTratamentoTableDTO>[] = [
      {
        accessorKey: 'ordem',
        header: 'Ordem',
        enableSorting: false,
        cell: ({ row: r }) => r.original.ordem ?? '—',
      },
      {
        accessorKey: 'servicoDesignacao',
        header: 'Designação',
        enableSorting: false,
        cell: ({ row: r }) =>
          r.original.servicoDesignacao?.trim() ||
          r.original.servicoId?.slice(0, 8) ||
          '—',
      },
      {
        accessorKey: 'duracao',
        header: 'Duração',
        enableSorting: false,
        cell: ({ row: r }) => r.original.duracao?.trim() || '—',
      },
      {
        accessorKey: 'usaFisioter',
        header: 'Fisio',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.usaFisioter),
      },
      {
        accessorKey: 'usaAuxiliar',
        header: 'Auxiliar',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.usaAuxiliar),
      },
      {
        accessorKey: 'usaOutro',
        header: 'Outro',
        enableSorting: false,
        cell: ({ row: r }) => bitCell(r.original.usaOutro),
      },
      {
        accessorKey: 'preco',
        header: 'Preço',
        enableSorting: false,
        cell: ({ row: r }) =>
          r.original.preco != null ? String(r.original.preco) : '—',
      },
      {
        accessorKey: 'valorUt',
        header: 'Valor utente',
        enableSorting: false,
        cell: ({ row: r }) =>
          r.original.valorUt != null ? String(r.original.valorUt) : '—',
      },
    ]

    return [
      ...base,
      createAreaComumListActionsColumnDef<ServicoTratamentoTableDTO>({
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
      }),
    ]
  }, [canView, canChange, canDelete])

  const handleConfirmDelete = async () => {
    if (!row) return
    setDeleting(true)
    try {
      const res = await ServicoTratamentoService(listPermId).delete(row.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Serviço removido.')
        setDeleteOpen(false)
        setRow(null)
        onRefresh()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível remover.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao remover.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-1.5'>
          <Label>Patologia</Label>
          <AsyncCombobox
            value={nomePatologia}
            disabled={!canChange}
            onChange={(v) => {
              const hit = patologiaItems.find((i) => i.value === v)
              onNomePatologiaChange(hit?.label ?? v)
            }}
            items={patologiaItems}
            searchValue={patSearch}
            onSearchValueChange={setPatSearch}
            isLoading={patologiaQ.isFetching}
            placeholder='Selecionar...'
            searchPlaceholder='Pesquisar patologia...'
            emptyText='Sem resultados'
          />
        </div>
        <div className='space-y-1.5'>
          <Label>Duração total</Label>
          <TimeField
            value={duracaoTotal}
            disabled={!canChange}
            placeholder='HH:mm'
            onChange={onDuracaoTotalChange}
          />
        </div>
      </div>

      {canChange ? (
        <div className='flex justify-end'>
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
            Inserir serviço
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={sorted}
        isLoading={isLoading}
        pageCount={1}
        totalRows={sorted.length}
        initialPage={1}
        initialPageSize={50}
        FilterControls={EmptyFilterControls}
        hideToolbarFilters
        onPaginationChange={() => undefined}
        onFiltersChange={() => undefined}
        onSortingChange={() => undefined}
      />

      <ServicoTratamentoFichaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        tratamentoId={tratamentoId}
        listPermId={listPermId}
        existing={sorted}
        row={row}
        onSaved={onRefresh}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja realmente remover este serviço prescrito?
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
              {deleting ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
