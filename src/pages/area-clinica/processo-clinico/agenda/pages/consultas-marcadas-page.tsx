import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { useGetAllTiposConsulta } from '@/pages/area-comum/tabelas/consultas/tipos-consultas/queries/listagem-tipos-consulta-queries'
import { useUtentesLight } from '@/pages/utentes/queries/utentes-queries'
import { TipoAdmissaoService } from '@/lib/services/consultas/tipo-admissao-service'
import type { TipoAdmissaoDTO } from '@/types/dtos/consultas/tipo-admissao.dtos'
import { MotivoConsultaService } from '@/lib/services/consultas/motivo-consulta-service'
import type { MotivoConsultaDTO } from '@/types/dtos/consultas/motivo-consulta.dtos'
import type { TipoConsultaDTO } from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
import type { ConsultaMarcadaRow } from '../types/consulta-marcada-types'
import { ConsultaMarcadaViewEditModal } from '../modals/consulta-marcada-view-edit-modal'
import { useConsultasDoDiaMarcacoes } from '../queries/consultas-do-dia-queries'
import { MarcacaoConsultaService } from '@/lib/services/consultas/marcacao-consulta-service'
import type { CreateMarcacaoConsultaBody } from '@/lib/services/consultas/marcacao-consulta-service/marcacao-consulta-client'

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
)

const MINUTE_OPTIONS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

const baseColumns: Array<ColumnDef<ConsultaMarcadaRow> & DataTableColumnDef<ConsultaMarcadaRow>> = [
  { accessorKey: 'dataLabel', header: 'Data', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.dataLabel ?? row.original.data ?? '—', meta: { align: 'left', width: 'w-[100px]' } },
  { accessorKey: 'horaMarcacaoLabel', header: 'Hora', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.horaMarcacaoLabel ?? '—', meta: { align: 'left', width: 'w-[80px]' } },
  { accessorKey: 'utenteNumero', header: 'Nº Utente', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.utenteNumero ?? '—', meta: { align: 'left', width: 'w-[100px]' } },
  { accessorKey: 'utenteNome', header: 'Nome Utente', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.utenteNome ?? '—', meta: { align: 'left', width: 'w-[200px]' } },
  { accessorKey: 'organismoNome', header: 'Organismo', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.organismoNome ?? row.original.organismoCodigo ?? '—', meta: { align: 'left', width: 'w-[120px]' } },
  { accessorKey: 'statusConsultaLabel', header: 'Estado', cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => row.original.statusConsultaLabel ?? '—', meta: { align: 'left', width: 'w-[120px]' } },
]

function getColumnsWithActions(
  onOpenView: (row: ConsultaMarcadaRow) => void,
  onOpenEdit: (row: ConsultaMarcadaRow) => void,
  onOpenDelete: (row: ConsultaMarcadaRow) => void
): Array<ColumnDef<ConsultaMarcadaRow> & DataTableColumnDef<ConsultaMarcadaRow>> {
  return [...baseColumns, {
    id: 'acoes',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: ({ row }: CellContext<ConsultaMarcadaRow, unknown>) => (
      <div className='flex items-center justify-end gap-1'>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver' onClick={(e) => { e.stopPropagation(); onOpenView(row.original) }}><Eye className='h-4 w-4' /></Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar' onClick={(e) => { e.stopPropagation(); onOpenEdit(row.original) }}><Pencil className='h-4 w-4' /></Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive' title='Apagar' onClick={(e) => { e.stopPropagation(); onOpenDelete(row.original) }}><Trash2 className='h-4 w-4' /></Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right', width: 'w-[90px]' },
  }]
}

function ConsultasMarcadasFilterControls(_: { table: any; columns: any[]; onApplyFilters: () => void; onClearFilters: () => void }) { return null }

export function ConsultasMarcadasPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false)
  const [viewEditMode, setViewEditMode] = useState<'view' | 'edit'>('view')
  const [selectedRow, setSelectedRow] = useState<ConsultaMarcadaRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ConsultaMarcadaRow | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const effectiveDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : getTodayStr()
  const { rows: consultasFiltradas, refetch } = useConsultasDoDiaMarcacoes(effectiveDateStr, { enabled: true })
  const filters: Array<{ id: string; value: string }> = [{ id: 'data', value: effectiveDateStr }]
  const handleOpenView = (row: ConsultaMarcadaRow) => { setSelectedRow(row); setViewEditMode('view'); setViewEditModalOpen(true) }
  const handleOpenEdit = (row: ConsultaMarcadaRow) => { setSelectedRow(row); setViewEditMode('edit'); setViewEditModalOpen(true) }
  const handleOpenDelete = (row: ConsultaMarcadaRow) => { setItemToDelete(row); setDeleteDialogOpen(true) }
  const handleEditSuccess = () => { refetch() }

  const deleteMarcacaoMutation = useMutation({
    mutationFn: async (id: string) => MarcacaoConsultaService().deleteMarcacaoConsulta(id),
    onSuccess: (res) => {
      const status = res.info?.status
      if (status === ResponseStatus.Success) {
        toast.success('Marcação removida da lista.')
        refetch()
        queryClient.invalidateQueries({ queryKey: ['consultas-do-dia-marcacoes'] })
      } else {
        const msg = res.info?.messages?.$ && res.info.messages.$.length > 0 ? res.info.messages.$[0] : 'Não foi possível eliminar a marcação.'
        toast.error(msg)
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao eliminar marcação.'),
  })

  const handleConfirmDelete = () => { if (!itemToDelete?.id) return; deleteMarcacaoMutation.mutate(itemToDelete.id); setDeleteDialogOpen(false); setItemToDelete(null) }
  const handleRefresh = () => { setPage(1); refetch() }
  const columns = useMemo(() => getColumnsWithActions(handleOpenView, handleOpenEdit, handleOpenDelete), [])
  const totalRegistos = consultasFiltradas.length
  const totalPages = Math.max(1, Math.ceil(totalRegistos / pageSize))
  const paginatedRows = useMemo(() => { const start = (page - 1) * pageSize; return consultasFiltradas.slice(start, start + pageSize) }, [consultasFiltradas, page, pageSize])
  const { data: tiposConsultaData } = useGetAllTiposConsulta()
  const tiposConsulta = (tiposConsultaData?.info?.data ?? []) as TipoConsultaDTO[]
  const { data: tiposAdmissaoData } = useQuery({ queryKey: ['tipos-admissao'], queryFn: async () => { const res = await TipoAdmissaoService().getAllTiposAdmissao(); return (res.info?.data ?? []) as TipoAdmissaoDTO[] }, staleTime: 5 * 60 * 1000 })
  const tiposAdmissao = tiposAdmissaoData ?? []
  const { data: motivosConsultaData } = useQuery({ queryKey: ['motivos-consulta'], queryFn: async () => { const res = await MotivoConsultaService().getAllMotivosConsulta(); return (res.info?.data ?? []) as MotivoConsultaDTO[] }, staleTime: 5 * 60 * 1000 })
  const motivosConsulta = motivosConsultaData ?? []
  const [utenteSearch, setUtenteSearch] = useState('')
  const { data: utentesLightData } = useUtentesLight(utenteSearch)
  const utentesLight = utentesLightData?.info?.data ?? []
  const [utenteId, setUtenteId] = useState<string>('')
  const [data, setData] = useState<string>('')
  const [hora, setHora] = useState<string>('')
  const [horaHour, setHoraHour] = useState<string>('')
  const [horaMinute, setHoraMinute] = useState<string>('')
  const [observacoes, setObservacoes] = useState<string>('')
  const [tipoConsultaId, setTipoConsultaId] = useState<string>('')
  const [tipoAdmissaoId, setTipoAdmissaoId] = useState<string>('')
  const [motivoConsultaId, setMotivoConsultaId] = useState<string>('')
  const createMarcacaoMutation = useMutation({
    mutationFn: async (body: CreateMarcacaoConsultaBody) => MarcacaoConsultaService().createMarcacaoConsulta(body),
    onSuccess: (res) => {
      const status = res.info?.status
      if (status === ResponseStatus.Success) {
        toast.success('Marcação criada com sucesso.')
        setDialogOpen(false); setUtenteId(''); setData(''); setHora(''); setObservacoes(''); setTipoConsultaId(''); setTipoAdmissaoId(''); setMotivoConsultaId(''); setUtenteSearch('')
        refetch(); queryClient.invalidateQueries({ queryKey: ['consultas-do-dia-marcacoes'] })
      } else {
        const msg = res.info?.messages?.$ && res.info.messages.$.length > 0 ? res.info.messages.$[0] : 'Não foi possível criar a marcação.'
        toast.error(msg)
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar marcação.'),
  })

  return (<><PageHead title='CliCloud' /><DashboardPageContainer><div className='flex flex-col gap-4'><div className='flex flex-wrap items-center justify-between gap-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'><h1 className='text-lg font-semibold'>Consultas Marcadas</h1><div className='flex items-center gap-2'><Popover><PopoverTrigger asChild><Button variant='outline' className={cn('min-w-[200px] justify-start text-left font-normal')}>{format(selectedDate ?? new Date(), "d 'de' MMMM 'de' yyyy", { locale: pt })}</Button></PopoverTrigger><PopoverContent className='w-auto p-0' align='start'><Calendar mode='single' selected={selectedDate ?? new Date()} onSelect={setSelectedDate} locale={pt} /></PopoverContent></Popover><Button variant='default' size='sm' className='h-8' onClick={() => setDialogOpen(true)}><Plus className='h-4 w-4 sm:mr-2' /><span className='hidden sm:inline'>Adicionar Consulta</span></Button><Button variant='outline' size='sm' className='h-8' onClick={handleRefresh} title='Atualizar'><RefreshCw className='h-4 w-4 sm:mr-2' /><span className='hidden sm:inline'>Atualizar</span></Button></div></div>
    <ConsultaMarcadaViewEditModal open={viewEditModalOpen} onOpenChange={setViewEditModalOpen} mode={viewEditMode} rowData={selectedRow} onSuccess={handleEditSuccess} />
    <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) { setDeleteDialogOpen(false); setItemToDelete(null) } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar consulta</AlertDialogTitle><AlertDialogDescription>Tem a certeza que pretende eliminar a marcação de {itemToDelete?.utenteNome ?? ''}? Esta ação não pode ser revertida.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirmDelete() }} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setUtenteId(''); setData(''); setHora(''); setHoraHour(''); setHoraMinute(''); setObservacoes(''); setTipoConsultaId(''); setTipoAdmissaoId(''); setMotivoConsultaId(''); setUtenteSearch('') } }}><DialogContent className='sm:max-w-lg'><DialogHeader><DialogTitle>Nova consulta</DialogTitle></DialogHeader><div className='grid gap-4 py-4'><div className='grid gap-2'><Label htmlFor='utente'>Utente</Label><Select value={utenteId} onValueChange={(val) => { setUtenteId(val) }}><SelectTrigger id='utente'><SelectValue placeholder='Selecionar ou procurar utente' /></SelectTrigger><SelectContent><div className='px-2 pb-2'><Input placeholder='Procurar utente...' value={utenteSearch} onChange={(e) => setUtenteSearch(e.target.value)} /></div>{utentesLight.map((u) => (<SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>))}</SelectContent></Select></div><div className='grid gap-4 md:grid-cols-2'><div className='grid gap-2'><Label htmlFor='data'>Data</Label><Input id='data' type='date' placeholder='Data' value={data || effectiveDateStr} onChange={(e) => setData(e.target.value)} /></div><div className='grid gap-2'><Label htmlFor='hora'>Hora</Label><div className='flex gap-2'><Select value={horaHour} onValueChange={(val) => { setHoraHour(val); if (horaMinute) { setHora(`${val}:${horaMinute}`) } }}><SelectTrigger className='w-[80px]'><SelectValue placeholder='HH' /></SelectTrigger><SelectContent>{HOUR_OPTIONS.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent></Select><Select value={horaMinute} onValueChange={(val) => { setHoraMinute(val); if (horaHour) { setHora(`${horaHour}:${val}`) } }}><SelectTrigger className='w-[80px]'><SelectValue placeholder='MM' /></SelectTrigger><SelectContent>{MINUTE_OPTIONS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div></div></div><div className='grid grid-cols-2 gap-4'><div className='grid gap-2'><Label htmlFor='tipo'>Tipo de consulta</Label><Select value={tipoConsultaId} onValueChange={setTipoConsultaId}><SelectTrigger id='tipo' className='w-full'><SelectValue placeholder='Selecionar tipo de consulta' /></SelectTrigger><SelectContent>{tiposConsulta.map((t) => (<SelectItem key={t.id} value={t.id}>{t.designacao}</SelectItem>))}</SelectContent></Select></div><div className='grid gap-2'><Label htmlFor='tipo-admissao'>Tipo de admissão</Label><Select value={tipoAdmissaoId} onValueChange={setTipoAdmissaoId}><SelectTrigger id='tipo-admissao' className='w-full'><SelectValue placeholder='Selecionar tipo de admissão' /></SelectTrigger><SelectContent>{tiposAdmissao.map((t: TipoAdmissaoDTO) => (<SelectItem key={t.id} value={t.id}>{t.designacao}</SelectItem>))}</SelectContent></Select></div></div><div className='grid gap-2'><Label htmlFor='motivo-consulta'>Motivo da Consulta</Label><Select value={motivoConsultaId} onValueChange={setMotivoConsultaId}><SelectTrigger id='motivo-consulta' className='w-full'><SelectValue placeholder='Motivo da Consulta...' /></SelectTrigger><SelectContent>{motivosConsulta.map((m: MotivoConsultaDTO) => (<SelectItem key={m.id} value={m.id}>{m.designacao}</SelectItem>))}</SelectContent></Select></div><div className='grid gap-2'><Label htmlFor='observacoes'>Observações</Label><Input id='observacoes' placeholder='Observações (opcional)' value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div></div><DialogFooter><Button variant='outline' onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type='button' onClick={() => { if (!utenteId) { toast.error('Selecione um utente.'); return } const dataValue = (data || effectiveDateStr).trim(); if (!dataValue) { toast.error('Indique a data.'); return } if (!hora) { toast.error('Indique a hora.'); return } const body: CreateMarcacaoConsultaBody = { utenteId, data: dataValue, horaInic: hora, horaFim: null, obs: observacoes || undefined, consultaId: undefined, medicoId: undefined, especialidadeId: undefined, organismoId: undefined, motivoConsultaId: motivoConsultaId || undefined, tipoAdmissaoId: tipoAdmissaoId || undefined, tipoConsultaId: tipoConsultaId || undefined }; createMarcacaoMutation.mutate(body) }}>Guardar</Button></DialogFooter></DialogContent></Dialog>
    <div className='rounded-b-lg border border-t-0 bg-card'><DataTable columns={columns} data={paginatedRows} pageCount={totalPages} totalRows={totalRegistos} initialPage={page} initialPageSize={pageSize} initialFilters={filters} initialSorting={sorting} onPaginationChange={(newPage, newPageSize) => { setPage(newPage); setPageSize(newPageSize) }} onFiltersChange={() => {}} onSortingChange={(newSorting) => { setSorting(newSorting) }} FilterControls={ConsultasMarcadasFilterControls} hideToolbar /></div>
  </div></DashboardPageContainer></>)
}
