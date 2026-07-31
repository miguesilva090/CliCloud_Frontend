import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import type { ReactNode } from 'react'

export const LOTE_DIRECT_HIDDEN_FILTER_COLUMNS = [
  'numerolote',
  'numerolote_de',
  'numerolote_ate',
  'codigoorganismo',
  'mes',
  'mes_de',
  'mes_ate',
  'ano',
  'ano_de',
  'ano_ate',
  'utentenumero_de',
  'utentenumero_ate',
  'utentenome',
  'datafim_de',
  'datafim_ate',
] as const

function formatMesAnoLegado(mesAno?: string | null): string {
  if (!mesAno?.trim()) return '-'
  const [mes, ano] = mesAno.split('/')
  if (!mes || !ano) return mesAno
  const mesNum = Number.parseInt(mes, 10)
  if (mesNum >= 1 && mesNum <= 12) {
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]
    return `${nomes[mesNum - 1]}/${ano}`
  }
  return mesAno
}

function formatMoney(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatTaxaModeradora(isencao?: number | null): string {
  if (isencao == null || isencao === 0) return ' '
  const labels = ['Isento', 'Não Isento', 'E111', 'H', '+ 65 anos']
  return labels[isencao - 1] ?? String(isencao)
}

const baseColumns: DataTableColumnDef<LoteDirectTableDTO>[] = [
  {
    accessorKey: 'credencial',
    header: 'Credencial',
    sortKey: 'credencial',
    enableSorting: true,
    cell: ({ row }) => row.original.credencial || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Cód. Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNumero || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNome || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'mesAno',
    header: 'Mês/Ano',
    enableSorting: false,
    cell: ({ row }) => formatMesAnoLegado(row.original.mesAno),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroLote',
    header: 'N.º Lote',
    sortKey: 'numeroLote',
    enableSorting: true,
    cell: ({ row }) =>
      row.original.numeroLote != null ? String(row.original.numeroLote) : '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'codigoOrganismo',
    header: 'Organismo',
    sortKey: 'codigoOrganismo',
    enableSorting: true,
    cell: ({ row }) => {
      const sigla = row.original.organismoSigla?.trim()
      const nome = row.original.organismoNome?.trim()
      const cod = row.original.codigoOrganismo
      if (sigla) {
        const title = [nome, cod != null ? `Código ULS: ${cod}` : null]
          .filter(Boolean)
          .join(' — ')
        return <span title={title || undefined}>{sigla}</span>
      }
      if (nome) return nome
      if (cod != null) return String(cod)
      return '-'
    },
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'valorTaxas',
    header: 'Taxas',
    enableSorting: false,
    cell: ({ row }) => formatMoney(row.original.valorTaxas),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'valorTotal',
    header: 'Total',
    enableSorting: false,
    cell: ({ row }) => formatMoney(row.original.valorTotal),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'tipoServico',
    header: 'Tipo Serviço',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoServicoDesignacao?.trim()
      || (row.original.tipoServico != null ? String(row.original.tipoServico) : '-'),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoLote',
    header: 'Tipo Lote',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoLoteDesignacao?.trim()
      || (row.original.tipoLote != null ? String(row.original.tipoLote) : '-'),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'txmoderadora',
    header: 'Taxa mod.',
    enableSorting: false,
    cell: ({ row }) => formatTaxaModeradora(row.original.isencao),
    meta: { align: 'left' as const },
  },
]

const hiddenFilterColumn = (id: string): DataTableColumnDef<LoteDirectTableDTO> => ({
  id,
  accessorKey: id,
  header: '',
  enableSorting: false,
  enableHiding: false,
  meta: { hidden: true },
  cell: () => null,
})

export function getLoteDirectColumns(
  onOpenView: (data: LoteDirectTableDTO) => void,
  onOpenEdit?: (data: LoteDirectTableDTO) => void,
  onOpenDelete?: (data: LoteDirectTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: LoteDirectTableDTO) => ReactNode
): DataTableColumnDef<LoteDirectTableDTO>[] {
  return [
    ...LOTE_DIRECT_HIDDEN_FILTER_COLUMNS.map((id) => hiddenFilterColumn(id)),
    ...baseColumns,
    createAreaComumListActionsColumnDef<LoteDirectTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions,
    }),
  ]
}