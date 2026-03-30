import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { MedicoTableDTO } from '@/types/dtos/saude/medicos.dtos'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteMedico } from '@/pages/medicos/queries/medicos-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openMedicoEditInApp, openMedicoViewInApp } from '@/utils/window-utils'

const LISTAGEM_RETURN_PATH = '/area-comum/tabelas/entidades/medicos'

function ListagemMedicoRowActions({
  id,
  nome,
}: {
  id: string
  nome?: string | null
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const del = useDeleteMedico({ onSuccessNavigateTo: LISTAGEM_RETURN_PATH })

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => openMedicoViewInApp(navigate, addWindow, id, nome)}
        title='Ver'
      >
        <Eye className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => openMedicoEditInApp(navigate, addWindow, id, nome)}
        title='Editar'
      >
        <Pencil className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-destructive hover:text-destructive'
        disabled={del.isPending}
        onClick={() => {
          const ok = window.confirm(
            `Apagar o médico "${nome || id}"?

Esta ação não pode ser desfeita.`
          )
          if (!ok) return
          del.mutate(id)
        }}
        title='Apagar'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export const listagemMedicosColumns: Array<
  ColumnDef<MedicoTableDTO> & DataTableColumnDef<MedicoTableDTO>
> = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => {
      const nome = row.original.nome || '—'
      return <span>{nome}</span>
    },
    meta: { align: 'left' },
  },
  {
    id: 'codigoPostal',
    header: 'Código Postal',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => {
      const cp = row.original.codigoPostal
      if (!cp) return '—'
      if (cp.localidade) return `${cp.codigo ?? ''} ${cp.localidade}`.trim()
      return cp.codigo ?? '—'
    },
    meta: { align: 'left' },
  },
  {
    accessorKey: 'especialidadeNome',
    header: 'Especialidade',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) =>
      row.original.especialidadeNome || '—',
    meta: { align: 'left' },
  },
  {
    id: 'globalbooking',
    header: 'Globalbooking',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) =>
      row.original.globalbooking ? <Check className='h-4 w-4' /> : null,
    meta: { align: 'center', width: '80px' },
  },
  {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => {
      const status = row.original.status
      if (status == null) return '—'
      return status === 1 ? 'Ativo' : 'Inativo'
    },
    meta: { align: 'left', width: '90px' },
  },
  {
    id: 'opcoes',
    header: 'Opções',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => (
      <ListagemMedicoRowActions id={row.original.id} nome={row.original.nome} />
    ),
    enableSorting: false,
    meta: { align: 'right' },
  },
]

