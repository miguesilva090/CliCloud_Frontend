import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { FicheiroEletronicoRegistoTableDTO } from '@/types/dtos/faturacao/ficheiros-eletronicos.dtos'
import { formatDateTimePt } from '../utils/ficheiro-eletronico-display'

export type FicheiroEletronicoRow = FicheiroEletronicoRegistoTableDTO & {
  codigoVisual: number
}

export const ficheiroEletronicoColumns: DataTableColumnDef<FicheiroEletronicoRow>[] =
  [
    {
      accessorKey: 'codigoVisual',
      header: 'Código',
      sortKey: 'codigoVisual',
      enableSorting: true,
      meta: { align: 'left' as const, width: 'w-[90px]' },
      cell: ({ row }) => row.original.codigoVisual,
    },
    {
      accessorKey: 'numeroExibicaoDocumento',
      header: 'N.º Documento',
      sortKey: 'numeroExibicaoDocumento',
      enableSorting: true,
      meta: { align: 'left' as const },
      cell: ({ row }) =>
        row.original.numeroExibicaoDocumento?.trim() ||
        row.original.documentoId ||
        '—',
    },
    {
      accessorKey: 'dataDocumento',
      header: 'Data da Fatura',
      sortKey: 'dataDocumento',
      enableSorting: true,
      meta: { align: 'left' as const, width: 'w-[170px]' },
      cell: ({ row }) => formatDateTimePt(row.original.dataDocumento),
    },
    {
      accessorKey: 'sigla',
      header: 'Tipo',
      sortKey: 'sigla',
      enableSorting: true,
      meta: { align: 'left' as const, width: 'w-[110px]' },
      cell: ({ row }) => row.original.sigla ?? '—',
    },
    {
      accessorKey: 'dataGeracao',
      header: 'Data de Criação',
      sortKey: 'dataGeracao',
      enableSorting: true,
      meta: { align: 'left' as const, width: 'w-[170px]' },
      cell: ({ row }) => formatDateTimePt(row.original.dataGeracao),
    },
  ]
