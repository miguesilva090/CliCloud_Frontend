import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { LoteDirectAgregadoTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function formatMoney(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatMesAno(mes: number, ano: number): string {
  const nome = MESES[mes - 1]
  return nome ? `${nome}/${ano}` : `${mes}/${ano}`
}

export const loteDirectAgregadosColumns: DataTableColumnDef<LoteDirectAgregadoTableDTO>[] =
  [
    {
      accessorKey: 'indice',
      header: 'Índice',
      sortKey: 'indice',
      enableSorting: true,
      cell: ({ row }) => String(row.original.indice),
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'numeroLote',
      header: 'N.º Lote',
      sortKey: 'numeroLote',
      enableSorting: true,
      cell: ({ row }) => String(row.original.numeroLote),
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'mes',
      header: 'Mês/Ano',
      enableSorting: false,
      cell: ({ row }) => formatMesAno(row.original.mes, row.original.ano),
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'codigoOrganismo',
      header: 'Organismo',
      sortKey: 'codigoOrganismo',
      enableSorting: true,
      cell: ({ row }) => {
        const sigla = row.original.organismoSigla?.trim()
        const cod = row.original.codigoOrganismo
        if (sigla) {
          return (
            <span title={`Código ULS: ${cod}`}>{sigla}</span>
          )
        }
        return String(cod)
      },
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'tipoLoteDesignacao',
      header: 'Tipo Lote',
      enableSorting: false,
      cell: ({ row }) => row.original.tipoLoteDesignacao || String(row.original.tipoLote),
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'tipoServico',
      header: 'Tipo Serviço',
      sortKey: 'tipoServico',
      enableSorting: true,
      cell: ({ row }) => String(row.original.tipoServico),
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'numeroRequisicoes',
      header: 'Req.',
      enableSorting: false,
      cell: ({ row }) => String(row.original.numeroRequisicoes),
      meta: { align: 'right' as const },
    },
    {
      accessorKey: 'quantidade',
      header: 'Qtd.',
      enableSorting: false,
      cell: ({ row }) => String(row.original.quantidade),
      meta: { align: 'right' as const },
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
  ]
