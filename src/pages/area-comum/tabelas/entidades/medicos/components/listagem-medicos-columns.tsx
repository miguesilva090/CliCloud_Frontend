import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { MedicoTableDTO } from '@/types/dtos/saude/medicos.dtos'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toFullUrl } from '@/utils/image-url-helpers'
import state from '@/states/state'
import { useDeleteMedico } from '@/pages/medicos/queries/medicos-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openMedicoEditInApp, openMedicoViewInApp } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_RETURN_PATH = '/area-comum/tabelas/entidades/medicos'
const medicosPermId = modules.areaComum.permissions.medicos.id

function ListagemMedicoRowActions({
  id,
  nome,
}: {
  id: string
  nome?: string | null
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canChange, canDelete } =
    useAreaComumEntityListPermissions(medicosPermId)
  const del = useDeleteMedico({ onSuccessNavigateTo: LISTAGEM_RETURN_PATH })

  return (
    <div className='flex items-center justify-end gap-1'>
      {canView ? (
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
      ) : null}
      {canChange ? (
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
      ) : null}
      {canDelete ? (
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
      ) : null}
    </div>
  )
}

function iniciaisNome(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function MedicoFotoAvatar({ row }: { row: MedicoTableDTO }) {
  const nome = row.nome?.trim() || '—'
  const fotoSrc = toFullUrl(row.urlFoto, state.URL)
  const initials = nome !== '—' ? iniciaisNome(nome) : ''

  return (
    <div className='flex justify-center'>
      <Avatar
        className={cn(
          'h-14 w-14 shrink-0 transition-transform duration-200 ease-out ring-2 ring-border mr-2',
          'hover:scale-110'
        )}
        title={nome !== '—' ? nome : undefined}
      >
        {fotoSrc ? (
          <AvatarImage src={fotoSrc} alt={nome === '—' ? '' : nome} />
        ) : null}
        <AvatarFallback className='bg-muted text-sm font-medium text-muted-foreground'>
          {initials ? (
            initials
          ) : (
            <User className='h-5 w-5' aria-hidden />
          )}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

export const listagemMedicosColumns: Array<
  ColumnDef<MedicoTableDTO> & DataTableColumnDef<MedicoTableDTO>
> = [
  {
    id: 'foto',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => (
      <MedicoFotoAvatar row={row.original} />
    ),
    enableSorting: false,
    meta: { align: 'center' as const, width: '96px' },
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => {
      const nome = row.original.nome?.trim() || '—'
      return <span className='truncate'>{nome}</span>
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
    id: 'acoes',
    header: () => <div className='w-full pr-5 text-right'>Ações</div>,
    cell: ({ row }: CellContext<MedicoTableDTO, unknown>) => (
      <ListagemMedicoRowActions id={row.original.id} nome={row.original.nome} />
    ),
    enableSorting: false,
    meta: { align: 'right' },
  },
]

