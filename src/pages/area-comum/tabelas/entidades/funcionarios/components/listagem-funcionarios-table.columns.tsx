import type { FuncionarioTableDTO } from '@/types/dtos/saude/funcionarios.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  mergeRowActionPermissions,
  type AreaComumListRowActionPermissions,
} from '@/hooks/use-area-comum-entity-list-permissions'

function getRua(row: FuncionarioTableDTO): string {
  const rua = row.rua?.nome ?? (row.rua as { Nome?: string })?.Nome
  return rua ?? '—'
}

function getCodigoPostal(row: FuncionarioTableDTO): string {
  const cp = row.codigoPostal
  const codigo = cp?.codigo ?? (cp as { Codigo?: string })?.Codigo
  const loc = cp?.localidade ?? (cp as { Localidade?: string })?.Localidade
  if (codigo && loc) return `${codigo} ${loc}`
  if (codigo) return codigo
  return '—'
}

export const columns: DataTableColumnDef<FuncionarioTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.nome ?? '—',
  },
  {
    id: 'rua',
    header: 'Rua',
    cell: ({ row }) => getRua(row.original),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'codigoPostal',
    header: 'Código Postal',
    cell: ({ row }) => getCodigoPostal(row.original),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroContribuinte',
    header: 'Nº Contribuinte',
    sortKey: 'numeroContribuinte',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.numeroContribuinte ?? '—',
  },
  {
    id: 'telefone',
    header: 'Telefone',
    cell: ({ row }) => row.original.contacto ?? '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroCartaoIdentificacao',
    header: 'Nº Cartão Identificação',
    sortKey: 'numeroCartaoIdentificacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.numeroCartaoIdentificacao ?? '—',
  },
  {
    accessorKey: 'arquivo',
    header: 'Arquivo',
    sortKey: 'arquivo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.arquivo ?? '—',
  },
  {
    id: 'dataEmissao',
    header: 'Data Emissão',
    cell: ({ row }) => {
      const d = row.original.dataEmissaoCartaoIdentificacao
      return d ? String(d).slice(0, 10) : '—'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Ver'
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Editar'
        >
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: FuncionarioTableDTO) => void,
  onOpenEdit?: (data: FuncionarioTableDTO) => void,
  onOpenDelete?: (data: FuncionarioTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<FuncionarioTableDTO>[] {
  const { canView, canChange, canDelete } =
    mergeRowActionPermissions(rowActionPermissions)

  return [
    ...columns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          {canView ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onOpenView(row.original)}
              title='Ver'
            >
              <Eye className='h-4 w-4' />
            </Button>
          ) : null}
          {canChange ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onOpenEdit?.(row.original)}
              title='Editar'
            >
              <Pencil className='h-4 w-4' />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => onOpenDelete?.(row.original)}
              title='Apagar'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          ) : null}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}
