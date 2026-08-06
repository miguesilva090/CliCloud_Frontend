import type { ReactNode } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { CredenciaisSnsLoteTableDTO } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import { imprimirEtiquetasCredenciaisSns } from '../utils/credenciais-sns-acoes'

export const CREDENCIAIS_SNS_HIDDEN_FILTER_COLUMNS = [
  'filtrobox',
  'datalotede',
  'dataloteate',
  'numerolotede',
  'numeroloteate',
  'codigoorganismode',
  'codigoorganismoate',
  'anode',
  'anoate',
  'mesde',
  'mesate',
] as const

function formatMoney(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

const hiddenFilterColumn = (
  id: string
): DataTableColumnDef<CredenciaisSnsLoteTableDTO> => ({
  id,
  accessorKey: id,
  header: '',
  enableSorting: false,
  enableHiding: false,
  meta: { hidden: true },
  cell: () => null,
})

const baseColumns: DataTableColumnDef<CredenciaisSnsLoteTableDTO>[] = [
  {
    accessorKey: 'numeroLote',
    header: 'N.º Lote',
    sortKey: 'numeroLote',
    enableSorting: true,
    cell: ({ row }) => String(row.original.numeroLote),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'dataLote',
    header: 'Data',
    sortKey: 'dataLote',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.dataLote),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'valorTaxa',
    header: 'Taxa mod.',
    enableSorting: false,
    cell: ({ row }) => formatMoney(row.original.valorTaxa),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'valor',
    header: 'Valor total',
    sortKey: 'valor',
    enableSorting: true,
    cell: ({ row }) => formatMoney(row.original.valor),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'ano',
    header: 'Ano',
    sortKey: 'ano',
    enableSorting: true,
    cell: ({ row }) => String(row.original.ano),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'mesNome',
    header: 'Mês',
    enableSorting: false,
    cell: ({ row }) => row.original.mesNome || String(row.original.mes),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    sortKey: 'codigoOrganismo',
    enableSorting: true,
    cell: ({ row }) => {
      const nome = row.original.organismoNome?.trim()
      const sigla = row.original.organismoSigla?.trim()
      const cod = row.original.codigoOrganismo
      const label = nome || sigla || String(cod)
      const title = nome && sigla ? `${nome} (${sigla})` : `Código ULS: ${cod}`
      return <span title={title}>{label}</span>
    },
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoLoteDesignacao',
    header: 'Tipo Lote',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoLoteDesignacao || String(row.original.tipoLote),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoServicoDesignacao',
    header: 'Tipo Serviço',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoServicoDesignacao || String(row.original.tipoServico),
    meta: { align: 'left' as const },
  },
]

export function getCredenciaisSnsColumns(
  onOpenView: (data: CredenciaisSnsLoteTableDTO) => void,
  onOpenDelete?: (data: CredenciaisSnsLoteTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: CredenciaisSnsLoteTableDTO) => ReactNode
): DataTableColumnDef<CredenciaisSnsLoteTableDTO>[] {
  const etiquetaAction = (data: CredenciaisSnsLoteTableDTO) => (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='h-8 w-8'
      onClick={() => imprimirEtiquetasCredenciaisSns(data)}
      title='Etiquetas'
    >
      <Tag className='h-4 w-4' />
    </Button>
  )

  return [
    ...CREDENCIAIS_SNS_HIDDEN_FILTER_COLUMNS.map((id) => hiddenFilterColumn(id)),
    ...baseColumns,
    createAreaComumListActionsColumnDef({
      onOpenView,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions: (data) => (
        <>
          {etiquetaAction(data)}
          {renderExtraActions?.(data)}
        </>
      ),
    }),
  ]
}
