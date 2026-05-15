import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { subsistemasServicosColumns } from '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/components/listagem-subsistemas-servicos-table.columns'
import { useGetSubsistemasServicosPaginated } from '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/queries/listagem-subsistemas-servicos-queries'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import { toast } from '@/utils/toast-utils'
import type { LinhaServicoForm, TaxaModeradora } from './admissao-form-utils'
import { buildLinhasFromSubsistemasSelecionados } from './admissao-subsistemas-selecao-utils'

function EmptyFilterControls() {
  return null
}

/**
 * Equivalente legado: Acor_InsLst em modo seleção (GS.openFrameWindow + HiddenInputSubServicos).
 * Não navega para /tabelas/subsistemas-servicos — evita conflito de rotas/instanceId no window-manager.
 */
export function AdmissaoSelecaoSubsistemasDialog({
  open,
  onOpenChange,
  organismoId,
  organismoLabel,
  numLinhasInserir,
  servicosLight,
  taxaModeradora,
  taxaModeradoraAtiva,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organismoId: string
  organismoLabel?: string
  numLinhasInserir: number
  servicosLight: ServicoLightDTO[]
  taxaModeradora: TaxaModeradora
  taxaModeradoraAtiva: boolean
  onConfirm: (linhas: LinhaServicoForm[]) => void
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<Array<{ id: string; value: string }>>([])
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [selectedById, setSelectedById] = useState<
    Map<string, SubsistemaServicoTableDTO>
  >(() => new Map())

  const { data, isLoading } = useGetSubsistemasServicosPaginated(
    page,
    pageSize,
    filters,
    sorting,
    organismoId
  )

  const servicoIds = useMemo(
    () => new Set(servicosLight.map((s) => s.id)),
    [servicosLight]
  )

  const rows = useMemo(
    () =>
      (data?.info?.data ?? []).filter(
        (r) => !r.inativo && servicoIds.has(r.servicoId)
      ),
    [data?.info?.data, servicoIds]
  )
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0

  const selectedIdsOnPage = useMemo(
    () => rows.filter((r) => selectedById.has(r.id)).map((r) => r.id),
    [rows, selectedById]
  )

  const selectedRows = useMemo(
    () => Array.from(selectedById.values()),
    [selectedById]
  )

  const handleRowSelectionChange = (idsOnPage: string[]) => {
    setSelectedById((prev) => {
      const next = new Map(prev)
      const pageIds = new Set(rows.map((r) => r.id))
      for (const id of pageIds) {
        if (!idsOnPage.includes(id)) next.delete(id)
      }
      for (const id of idsOnPage) {
        const row = rows.find((r) => r.id === id)
        if (row) next.set(id, row)
      }
      return next
    })
  }

  const title = organismoLabel?.trim()
    ? `Selecionar serviços — ${organismoLabel.length > 40 ? `${organismoLabel.slice(0, 40)}…` : organismoLabel}`
    : 'Selecionar subsistemas de serviços'

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      toast.error('Selecione pelo menos um serviço.')
      return
    }
    const linhas = buildLinhasFromSubsistemasSelecionados(
      selectedRows,
      numLinhasInserir,
      servicosLight,
      taxaModeradora,
      taxaModeradoraAtiva
    )
    onConfirm(linhas)
    setSelectedById(new Map())
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedById(new Map())
    onOpenChange(next)
  }

  const selectionColumns = useMemo(
    () => subsistemasServicosColumns.filter((c) => c.id !== 'actions'),
    []
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-[96vw] max-w-[1200px] flex-col overflow-hidden p-4'>
        <DialogHeader className='shrink-0'>
          <DialogTitle>{title}</DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Seleccione os serviços do organismo. Serão criadas {numLinhasInserir} linha(s) por
            cada serviço escolhido (comportamento legado).
          </p>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          <DataTable
            columns={selectionColumns}
            data={rows}
            pageCount={pageCount}
            totalRows={totalRows}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={(p, ps) => {
              setPage(p)
              setPageSize(ps)
            }}
            onFiltersChange={setFilters}
            onSortingChange={setSorting}
            FilterControls={EmptyFilterControls}
            selectedRows={selectedIdsOnPage}
            onRowSelectionChange={handleRowSelectionChange}
            globalSearchColumnId='servicoId'
            globalSearchPlaceholder='Procurar...'
            hideToolbarFilters
          />
        </div>

        <DialogFooter className='shrink-0 gap-2 border-t pt-3'>
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleConfirm}>
            Confirmar ({selectedById.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
