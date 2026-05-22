import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Checkbox } from '@/components/ui/checkbox'
import type { PedidoConsultaTableDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'
import type { ReactNode } from 'react'

function formatDateLegado(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function ReadOnlyBoolCell({ checked }: { checked: boolean }) {
  return (
    <div className='flex justify-center'>
      <Checkbox checked={checked} disabled aria-readonly />
    </div>
  )
}

const baseColumns: DataTableColumnDef<PedidoConsultaTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Codigo',
    sortKey: 'codigo',
    enableSorting: true,
  },
  { accessorKey: 'nome', header: 'Nome', enableSorting: true, sortKey: 'nome' },
  { accessorKey: 'telemovel', header: 'Telemóvel', enableSorting: true, sortKey: 'telemovel' },
  { accessorKey: 'email', header: 'Email', enableSorting: true, sortKey: 'email' },
  {
    accessorKey: 'especialidade',
    header: 'Especialidade',
    enableSorting: true,
    sortKey: 'especialidade',
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => formatDateLegado(row.original.data),
  },
  { accessorKey: 'hora', header: 'Hora', enableSorting: true, sortKey: 'hora' },
  { accessorKey: 'medico', header: 'Médico', enableSorting: true, sortKey: 'medico' },
  {
    accessorKey: 'agendado',
    header: 'Agendado',
    enableSorting: true,
    sortKey: 'agendado',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.agendado} />,
  },
  {
    accessorKey: 'emailPedido',
    header: 'Email',
    enableSorting: true,
    sortKey: 'emailPedido',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.emailPedido} />,
  },
  {
    accessorKey: 'smsPedido',
    header: 'Sms',
    enableSorting: true,
    sortKey: 'smsPedido',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.smsPedido} />,
  },
  {
    accessorKey: 'emailAgendado',
    header: 'Email Agend.',
    enableSorting: true,
    sortKey: 'emailAgendado',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.emailAgendado} />,
  },
  {
    accessorKey: 'smsAgendado',
    header: 'Sms Agend.',
    enableSorting: true,
    sortKey: 'smsAgendado',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.smsAgendado} />,
  },
  {
    accessorKey: 'recusado',
    header: 'Recusado',
    enableSorting: true,
    sortKey: 'recusado',
    meta: { align: 'center' as const },
    cell: ({ row }) => <ReadOnlyBoolCell checked={row.original.recusado} />,
  },
]

export function getGlobalBookingColumns(
  renderExtraActions: (row: PedidoConsultaTableDTO) => ReactNode
): DataTableColumnDef<PedidoConsultaTableDTO>[] {
  return [
    ...baseColumns,
    {
      id: 'actions',
      header: () => <div className='w-full pr-2 text-right'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex w-full items-center justify-end'>
          {renderExtraActions(row.original)}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}
