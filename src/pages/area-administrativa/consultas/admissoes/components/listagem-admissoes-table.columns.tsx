import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { ReactNode } from 'react'

const COL_CHECK_SM = 'w-[68px] min-w-[68px] max-w-[68px] px-1'
const COL_CHECK_PRES = 'w-[72px] min-w-[72px] max-w-[72px] px-1'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-PT')
}

function formatTime(value?: string | null) {
  if (!value) return '—'
  const parts = value.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return value
}

/** Legado AdmissoesLst: coluna Situação (Efectuado). */
function formatSituacao(row: AdmissaoTableDTO): string {
  const status = row.statusConsulta
  if (status === 7 || status === 8) return 'Faltou'
  if (row.efetuado === true) return 'Efectuada'
  if (row.confirmado === true) return 'Presente'
  return 'N/Efectuada'
}

function HeaderLabel({
  children,
  title,
  align = 'left',
}: {
  children: string
  title?: string
  align?: 'left' | 'center' | 'right'
}) {
  return (
    <span
      className={cn(
        'block text-[11px] font-semibold leading-snug tracking-wide uppercase text-foreground/90',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left'
      )}
      title={title ?? children}
    >
      {children}
    </span>
  )
}

function TruncatedCell({
  value,
  className,
}: {
  value?: string | null
  className?: string
}) {
  const text = value?.trim() || '—'
  return (
    <span className={cn('block truncate', className)} title={text === '—' ? undefined : text}>
      {text}
    </span>
  )
}

export type AdmissaoGridToggleHandlers = {
  canChange: boolean
  onTogglePresente: (row: AdmissaoTableDTO, value: boolean) => void
  onToggleConfirmaConsulta: (row: AdmissaoTableDTO, value: boolean) => void
  onToggleEmTratamento: (row: AdmissaoTableDTO, value: boolean) => void
}

function checkboxColumn(
  accessorKey: string,
  label: string,
  title: string,
  width: string,
  getChecked: (row: AdmissaoTableDTO) => boolean,
  onToggle: (row: AdmissaoTableDTO, value: boolean) => void,
  canChange: boolean
): DataTableColumnDef<AdmissaoTableDTO> {
  return {
    accessorKey,
    header: () => (
      <div className='flex w-full items-center justify-center'>
        <HeaderLabel title={title} align='center'>
          {label}
        </HeaderLabel>
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center' as const, width },
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={getChecked(row.original)}
          disabled={!canChange}
          onCheckedChange={(v) => {
            if (!canChange) return
            onToggle(row.original, v === true)
          }}
        />
      </div>
    ),
  }
}

const baseColumns = (
  toggles: AdmissaoGridToggleHandlers
): DataTableColumnDef<AdmissaoTableDTO>[] => [
  {
    accessorKey: 'data',
    header: () => <HeaderLabel>Data</HeaderLabel>,
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => (
      <span className='tabular-nums text-sm whitespace-nowrap'>
        {formatDate(row.original.data)}
      </span>
    ),
    meta: { align: 'center' as const, width: 'w-[92px] min-w-[92px]' },
  },
  {
    accessorKey: 'horaInicio',
    header: () => <HeaderLabel>Hora</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <span className='tabular-nums text-sm whitespace-nowrap'>
        {formatTime(row.original.horaInicio)}
      </span>
    ),
    meta: { align: 'center' as const, width: 'w-[60px] min-w-[60px]' },
  },
  {
    accessorKey: 'utenteNumero',
    header: () => <HeaderLabel title='Código do utente'>Cód. utente</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.utenteNumero} className='tabular-nums text-sm' />
    ),
    meta: { align: 'left' as const, width: 'w-[100px] min-w-[100px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: () => <HeaderLabel>Utente</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.utenteNome} className='text-sm font-medium' />
    ),
    meta: { align: 'center' as const, width: 'w-[160px] min-w-[160px] max-w-[200px]' },
  },
  {
    accessorKey: 'organismoNome',
    header: () => <HeaderLabel>Organismo</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => <TruncatedCell value={row.original.organismoNome} className='text-sm' />,
    meta: { align: 'center' as const, width: 'w-[150px] min-w-[150px] max-w-[190px]' },
  },
  {
    accessorKey: 'medicoNome',
    header: () => <HeaderLabel>Médico</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => <TruncatedCell value={row.original.medicoNome} className='text-sm' />,
    meta: { align: 'center' as const, width: 'w-[120px] min-w-[120px] max-w-[130px]' },
  },
  {
    accessorKey: 'especialidadeDesignacao',
    header: () => <HeaderLabel>Especialidade</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <TruncatedCell
        value={row.original.especialidadeDesignacao}
        className='text-xs uppercase tracking-tight'
      />
    ),
    meta: { align: 'left' as const, width: 'w-[130px] min-w-[130px] max-w-[160px]' },
  },
  {
    accessorKey: 'tipoConsultaDesignacao',
    header: () => <HeaderLabel>Consulta</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.tipoConsultaDesignacao} className='text-sm' />
    ),
    meta: { align: 'left' as const, width: 'w-[100px] min-w-[100px] max-w-[120px]' },
  },
  checkboxColumn(
    'confirmado',
    'Presente',
    'Presente na receção',
    COL_CHECK_PRES,
    (r) => Boolean(r.confirmado),
    toggles.onTogglePresente,
    toggles.canChange
  ),
  {
    accessorKey: 'pago',
    header: () => (
      <div className='flex w-full items-center justify-center'>
        <HeaderLabel align='center'>Pago</HeaderLabel>
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center' as const, width: COL_CHECK_SM },
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={row.original.pago === true}
          disabled
          className='pointer-events-none opacity-80'
        />
      </div>
    ),
  },
  checkboxColumn(
    'emTratamento',
    'Trat.',
    'Em tratamento',
    COL_CHECK_SM,
    (r) => Boolean(r.emTratamento),
    toggles.onToggleEmTratamento,
    toggles.canChange
  ),
  checkboxColumn(
    'confirmaConsulta',
    'Conf.',
    'Confirmação',
    COL_CHECK_SM,
    (r) => Boolean(r.confirmaConsulta),
    toggles.onToggleConfirmaConsulta,
    toggles.canChange
  ),
  {
    accessorKey: 'situacao',
    id: 'situacao',
    header: () => <HeaderLabel>Situação</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap' title={formatSituacao(row.original)}>
        {formatSituacao(row.original)}
      </span>
    ),
    meta: { align: 'center' as const, width: 'w-[106px] min-w-[106px] max-w-[116px] ' },
  },
  {
    accessorKey: 'salaNome',
    header: () => <HeaderLabel>Sala</HeaderLabel>,
    enableSorting: false,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.salaNome} className='text-sm max-w-[64px]' />
    ),
    meta: { align: 'center' as const, width: 'w-[74px] min-w-[74px] max-w-[74px]' },
  },
  {
    accessorKey: 'credencial',
    header: () => <HeaderLabel>Credencial</HeaderLabel>,
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => (
      <TruncatedCell value={row.original.credencial} className='text-sm tabular-nums' />
    ),
    meta: { align: 'left' as const, width: 'w-[90px] min-w-[90px]', hidden: true },
  },
]

export function getAdmissoesColumns(
  onOpenView: (data: AdmissaoTableDTO) => void,
  onOpenEdit?: (data: AdmissaoTableDTO) => void,
  onOpenDelete?: (data: AdmissaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: AdmissaoTableDTO) => ReactNode,
  toggles?: AdmissaoGridToggleHandlers
): DataTableColumnDef<AdmissaoTableDTO>[] {
  const toggleHandlers: AdmissaoGridToggleHandlers = toggles ?? {
    canChange: false,
    onTogglePresente: () => undefined,
    onToggleConfirmaConsulta: () => undefined,
    onToggleEmTratamento: () => undefined,
  }

  const actionsCol = createAreaComumListActionsColumnDef<AdmissaoTableDTO>({
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    rowActionPermissions,
    renderExtraActions,
    deleteTitle: 'Desmarcar',
  })

  const actionsWithMeta = {
    ...actionsCol,
    header: () => (
      <div className='w-full pr-5 text-center'>
        <HeaderLabel align='center'>Opções</HeaderLabel>
      </div>
    ),
    meta: { align: 'left' as const, width: 'w-[132px] min-w-[132px] max-w-[152px]' },
    cell: (ctx) => (
      <div className='pr-5'>
        {typeof actionsCol.cell === 'function' ? actionsCol.cell(ctx) : null}
      </div>
    ),
  } as DataTableColumnDef<AdmissaoTableDTO>

  /** Coluna flexível: em `table-fixed w-full` absorve o espaço extra até ao fim do container. */
  const fillColumn: DataTableColumnDef<AdmissaoTableDTO> = {
    id: 'admissoesTableFill',
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'left' as const },
  }

  return [...baseColumns(toggleHandlers), fillColumn, actionsWithMeta]
}
