import { useMemo, useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePageData } from '@/utils/page-data-utils'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import {
  useGetDocumentosPaginatedPageData,
  usePrefetchAdjacentDocumentos,
} from '@/pages/area-financeira/faturacao/queries/documento-queries'
import {
  formatDatePt,
  getDocumentoNumeroLabel,
} from '@/pages/area-financeira/faturacao/utils/faturacao-documento-display'
import {
  siglaToSlug,
  type FicheiroEletronicoSigla,
} from '../constants/ficheiro-eletronico-siglas'

const ID_FUNCIONALIDADE = 'documentos'

const SelecionarFaturaFilterControls = () => null

const selecionarFaturaColumns: DataTableColumnDef<DocumentoTableDTO>[] = [
  {
    accessorKey: 'numeroExibicao',
    header: 'N.º Documento',
    enableSorting: false,
    meta: { align: 'left' as const },
    cell: ({ row }) => getDocumentoNumeroLabel(row.original),
  },
  {
    accessorKey: 'data',
    header: 'Data da Fatura',
    enableSorting: false,
    meta: { align: 'left' as const },
    cell: ({ row }) => formatDatePt(row.original.data),
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.organismoNome ?? row.original.nomeCliente ?? '—',
  },
  {
    accessorKey: 'totalLiquido',
    header: 'Total',
    enableSorting: false,
    meta: { align: 'right' as const },
    cell: ({ row }) =>
      row.original.totalLiquido != null
        ? Number(row.original.totalLiquido).toLocaleString('pt-PT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '—',
  },
]

export function SelecionarFaturaOrganismoDialog({
  open,
  sigla,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  sigla: FicheiroEletronicoSigla
  onOpenChange: (open: boolean) => void
  onConfirm: (documento: DocumentoTableDTO) => void
}) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const defaultFilters = useMemo(
    () => [
      { id: 'anulado', value: 'false' },
      { id: 'siglaficheiro', value: siglaToSlug(sigla) },
    ],
    [sigla],
  )

  const {
    data,
    isLoading,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, f, s) =>
      useGetDocumentosPaginatedPageData(p, ps, f, s, ID_FUNCIONALIDADE),
    usePrefetchAdjacentData: (p, ps, f, s) =>
      usePrefetchAdjacentDocumentos(p, ps, f, s, ID_FUNCIONALIDADE),
    defaultFilters,
  })

  const documentos = useMemo(() => {
    const rows = data?.info?.data ?? []
    return rows.filter(
      (d) => d.organismoId && d.estaEmitido && !d.anulado,
    )
  }, [data?.info?.data])

  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = documentos.length
  const selectedDocumento = documentos.find((d) => selectedRows.includes(d.id))

  const title = `Selecionar fatura para anexar — ${sigla}`

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setSelectedRows([])
      }}
    >
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          Mostrar apenas faturas emitidas a organismo (equivalente ao legado
          TfaturaLst com SiglaFicheiro).
        </p>
        <DataTable
          columns={selecionarFaturaColumns}
          data={documentos}
          pageCount={pageCount}
          totalRows={totalRows}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          FilterControls={SelecionarFaturaFilterControls}
          initialPage={page}
          initialPageSize={pageSize}
          initialSorting={sorting}
          initialFilters={filters}
          isLoading={isLoading}
          selectedRows={selectedRows}
          onRowSelectionChange={(rows) =>
            setSelectedRows(rows.length ? [rows[rows.length - 1]] : [])
          }
          globalSearchColumnId='numeroExibicao'
          globalSearchPlaceholder='Procurar por n.º documento...'
        />
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            disabled={!selectedDocumento}
            onClick={() => {
              if (selectedDocumento) {
                onConfirm(selectedDocumento)
                setSelectedRows([])
              }
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
