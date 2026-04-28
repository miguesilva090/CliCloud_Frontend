import type { ModeloDocumentoDTO } from '@/types/dtos/documentos/motor-documental.dtos'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { FileText, Pencil, Trash2 } from 'lucide-react'

export function getDocumentosModeloColumns(
  onEdit: (row: ModeloDocumentoDTO) => void,
  onGerar: (row: ModeloDocumentoDTO) => void,
  onDelete: (row: ModeloDocumentoDTO) => void
): DataTableColumnDef<ModeloDocumentoDTO>[] {
  return [
    {
      accessorKey: 'codigo',
      header: 'Código',
      enableSorting: false,
      enableHiding: true,
      meta: { align: 'center' as const },
      cell: ({ row }) => (
        <span className='font-mono text-sm' title={row.original.codigo}>
          {row.original.codigo}
        </span>
      ),
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
      enableSorting: false,
      enableHiding: true,
      meta: { align: 'center' as const },
      cell: ({ row }) => (
        <span className='truncate' title={row.original.nome}>
          {row.original.nome}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Opções',
      cell: ({ row }) => (
        <div className='flex w-full flex-nowrap items-center justify-center gap-0.5'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            title='Editar'
            onClick={() => onEdit(row.original)}
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            title='Gerar Documento'
            onClick={() => onGerar(row.original)}
          >
            <FileText className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-destructive hover:text-destructive'
            title='Eliminar'
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        align: 'center' as const,
        width: 'w-[10.5rem] min-w-[10.5rem] max-w-[10.5rem] whitespace-nowrap',
      },
    },
  ]
}
