import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteUtente } from '../../queries/utentes-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp, openUtenteEditInApp } from '@/utils/window-utils'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

function UtenteNomeCell({ id, nome }: { id: string; nome: string }) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  return (
    <button
      type='button'
      className='cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-primary hover:underline'
      onClick={() =>
        openPathInApp(
          navigate,
          addWindow,
          `/utentes/${id}?from=utentes`,
          nome && nome !== '—' ? `Utente: ${nome}` : 'Utente'
        )
      }
    >
      {nome}
    </button>
  )
}

function UtenteRowActions({ id, nome }: { id: string; nome?: string | null }) {
  const navigate = useNavigate()
  const del = useDeleteUtente()
  const addWindow = useWindowsStore((s) => s.addWindow)

  return (
    <div className='flex w-full items-center justify-end gap-1'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() =>
          openPathInApp(
            navigate,
            addWindow,
            `/utentes/${id}?from=utentes`,
            nome ? `Utente: ${nome}` : 'Utente'
          )
        }
        title='Ver'
      >
        <Eye className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => openUtenteEditInApp(navigate, addWindow, id, nome)}
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
            `Apagar o utente "${nome || id}"?

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

export const columns: Array<ColumnDef<UtenteTableDTO> & DataTableColumnDef<UtenteTableDTO>> =
  [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) => {
        const nome = row.original.nome || '—'
        return (
          <UtenteNomeCell id={row.original.id} nome={nome} />
        )
      },
      meta: { align: 'left' },
    },
    {
      accessorKey: 'numeroUtente',
      header: 'Nº Utente',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        row.original.numeroUtente || '—',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'numeroContribuinte',
      header: 'NIF',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        row.original.numeroContribuinte || '—',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        row.original.email || '—',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'dataNascimento',
      header: 'Nascimento',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        formatDate(row.original.dataNascimento),
      meta: { align: 'left' },
    },
    {
      accessorKey: 'createdOn',
      header: 'Criado em',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        formatDate(row.original.createdOn),
      meta: { align: 'left' },
    },
    {
      id: 'opcoes',
      header: () => (
        <div className='w-full pr-5 text-right'>Opções</div>
      ),
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) => (
        <UtenteRowActions id={row.original.id} nome={row.original.nome} />
      ),
      enableSorting: false,
      meta: { align: 'right' as const },
    },
  ]


