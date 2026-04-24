import type { EmpresaTableDTO } from '@/types/dtos/saude/empresas.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  mergeRowActionPermissions,
  type AreaComumListRowActionPermissions,
} from '@/hooks/use-area-comum-entity-list-permissions'

function getLocalidade(row: EmpresaTableDTO): string {
  const cp = row.codigoPostal
  const loc = cp?.localidade ?? (cp as { Localidade?: string })?.Localidade
  if (loc) return loc
  const freg = row.freguesia
  const fregNome = freg?.nome ?? (freg as { Nome?: string })?.Nome
  if (fregNome) return fregNome
  return '—'
}

function getMorada(row: EmpresaTableDTO): string {
  const rua = row.rua
  const ruaNome = rua?.nome ?? (rua as { Nome?: string })?.Nome
  if (ruaNome) return ruaNome
  return '—'
}

export const columns: DataTableColumnDef<EmpresaTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'morada',
    header: 'Morada',
    cell: ({ row }) => getMorada(row.original),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
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
    id: 'localidade',
    header: 'Localidade',
    cell: ({ row }) => getLocalidade(row.original),
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
    id: 'descontoClinica',
    header: 'Desconto Clínica (%)',
    cell: ({ row }) =>
      row.original.desconto != null ? String(row.original.desconto) : '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'descontoUtente',
    header: 'Desconto Utente (%)',
    cell: ({ row }) =>
      row.original.descontoUtente != null
        ? String(row.original.descontoUtente)
        : '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
          <Eye className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar'>
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
  onOpenView: (data: EmpresaTableDTO) => void,
  onOpenEdit?: (data: EmpresaTableDTO) => void,
  onOpenDelete?: (data: EmpresaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<EmpresaTableDTO>[] {
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

