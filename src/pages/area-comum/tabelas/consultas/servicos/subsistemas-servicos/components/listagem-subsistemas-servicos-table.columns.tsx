import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'

function ServicoCell({ row }: { row: { original: SubsistemaServicoTableDTO } }) {
  const servicoId = row.original.servicoId

  const { data } = useQuery({
    queryKey: ['servicos-light-for-subsistemas-list'],
    queryFn: () => ServicoService().getServicoLight(),
    staleTime: 5 * 60 * 1000,
  })

  const lista = data?.info?.data ?? []
  const servico = lista.find((s) => s.id === servicoId)

  return <span>{servico?.designacao ?? servicoId}</span>
}

function OrganismoCell({ row }: { row: { original: SubsistemaServicoTableDTO } }) {
  const organismoId = row.original.organismoId

  const { data } = useQuery({
    queryKey: ['organismos-light-for-subsistemas-list'],
    queryFn: () => OrganismoService().getOrganismoLight(),
    staleTime: 5 * 60 * 1000,
  })

  const lista = data?.info?.data ?? []
  const organismo = lista.find((o) => o.id === organismoId)

  const label =
    organismo?.nome ??
    organismo?.nomeComercial ??
    organismo?.abreviatura ??
    organismoId

  return <span>{label}</span>
}

export const subsistemasServicosColumns: DataTableColumnDef<SubsistemaServicoTableDTO>[] =
  [
    {
      accessorKey: 'servicoId',
      header: 'Serviço',
      enableSorting: false,
      enableHiding: true,
      meta: { align: 'left' as const },
      cell: ({ row }) => <ServicoCell row={row} />,
    },
    {
      accessorKey: 'organismoId',
      header: 'Organismo',
      enableSorting: false,
      enableHiding: true,
      meta: { align: 'left' as const },
      cell: ({ row }) => <OrganismoCell row={row} />,
    },
    {
      accessorKey: 'valorServico',
      header: 'Val. Serv. (EUR)',
      sortKey: 'valorServico',
      enableSorting: true,
      enableHiding: true,
      meta: { align: 'right' as const },
      cell: ({ row }) => {
        const value = row.original.valorServico ?? 0
        return <span className='tabular-nums'>{value.toFixed(2)}</span>
      },
    },
    {
      accessorKey: 'valorOrganismo',
      header: 'Val. Org. (EUR)',
      sortKey: 'valorOrganismo',
      enableSorting: true,
      enableHiding: true,
      meta: { align: 'right' as const },
      cell: ({ row }) => {
        const value = row.original.valorOrganismo ?? 0
        return <span className='tabular-nums'>{value.toFixed(2)}</span>
      },
    },
    {
      accessorKey: 'valorUtente',
      header: 'Val. Utente (EUR)',
      sortKey: 'valorUtente',
      enableSorting: true,
      enableHiding: true,
      meta: { align: 'right' as const },
      cell: ({ row }) => {
        const value = row.original.valorUtente ?? 0
        return <span className='tabular-nums'>{value.toFixed(2)}</span>
      },
    },
    {
      accessorKey: 'inativo',
      header: 'Estado',
      sortKey: 'inativo',
      enableSorting: true,
      meta: { align: 'center' as const },
      cell: ({ row }) => (row.original.inativo ? 'Inativo' : 'Ativo'),
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

export function getSubsistemasServicosColumnsWithViewCallback(
  onOpenView: (data: SubsistemaServicoTableDTO) => void,
  onOpenEdit?: (data: SubsistemaServicoTableDTO) => void,
  onOpenDelete?: (data: SubsistemaServicoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<SubsistemaServicoTableDTO>[] {
  return [
    ...subsistemasServicosColumns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<SubsistemaServicoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}


