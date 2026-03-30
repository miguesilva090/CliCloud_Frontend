import type { OrganismoTableDTO } from '@/types/dtos/saude/organismos.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2, Check } from 'lucide-react'

function getLocalidade(row: OrganismoTableDTO): string {
  const cp = row.codigoPostal
  const loc = cp?.localidade ?? (cp as { Localidade?: string })?.Localidade
  if (loc) return loc
  const freg = row.freguesia
  const fregNome = freg?.nome ?? (freg as { Nome?: string })?.Nome
  if (fregNome) return fregNome
  return '—'
}

export const columns: DataTableColumnDef<OrganismoTableDTO>[] = [
  {
    id: 'codigo',
    header: 'Código',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const, width: '80px' },
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
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
    id: 'telefone',
    header: 'Telefone',
    cell: ({ row }) => row.original.contacto ?? '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'prazoPagamento',
    header: 'Prazo Pagamento',
    cell: ({ row }) => {
      const v = row.original.prazoPagamento
      return v != null ? String(v) : '—'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'descontoClinica',
    header: 'Desconto Clínica',
    cell: ({ row }) => {
      const v = row.original.desconto
      return v != null ? `${v}%` : '—'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'descontoUtente',
    header: 'Desconto Utente',
    cell: ({ row }) => {
      const v = row.original.descontoUtente
      return v != null ? `${v}%` : '—'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'globalbooking',
    header: 'Globalbooking',
    cell: ({ row }) =>
      row.original.globalbooking ? <Check className='h-4 w-4' /> : null,
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'center' as const, width: '100px' },
  },
  {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      if (status == null) return '—'
      return status === 1 ? 'Ativo' : 'Inativo'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const, width: '90px' },
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
  onOpenView: (data: OrganismoTableDTO) => void,
  onOpenEdit?: (data: OrganismoTableDTO) => void,
  onOpenDelete?: (data: OrganismoTableDTO) => void
): DataTableColumnDef<OrganismoTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
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
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}
