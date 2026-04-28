import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExamesSemPapelService } from '@/lib/services/consultas/exames-sem-papel-service'
import type {
  ExameSemPapelTabelaDTO,
  ExamesSemPapelContextoDTO,
} from '@/types/dtos/consultas/exames-sem-papel.dtos'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

const columns: Array<ColumnDef<ExameSemPapelTabelaDTO> & DataTableColumnDef<ExameSemPapelTabelaDTO>> = [
  {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
        aria-label='Selecionar todos'
      />
    ),
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label={`Selecionar ${row.original.requisicaoNum}`}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center', width: 'w-10 min-w-[2.5rem]' },
  },
  {
    accessorKey: 'requisicaoNum',
    header: 'Requisição Nº',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block truncate' title={String(row.original.requisicaoNum ?? '')}>
        {row.original.requisicaoNum || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[88px] min-w-[88px]' },
  },
  {
    accessorKey: 'utente',
    header: 'Utente',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block truncate' title={String(row.original.utente ?? '')}>
        {row.original.utente || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[148px] min-w-[148px]' },
  },
  {
    accessorKey: 'area',
    header: 'Área',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block truncate text-center' title={String(row.original.area ?? '')}>
        {row.original.area || '-'}
      </span>
    ),
    meta: { align: 'center', width: 'w-[64px] min-w-[64px]' },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block truncate' title={String(row.original.estado ?? '')}>
        {row.original.estado || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[104px] min-w-[104px]' },
  },
  {
    accessorKey: 'lotes',
    header: 'Lotes',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox checked={row.original.lotes} disabled aria-label='Lotes' />
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[52px] min-w-[52px]' },
  },
  {
    accessorKey: 'medico',
    header: 'Médico',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block truncate' title={String(row.original.medico ?? '')}>
        {row.original.medico || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[136px] min-w-[136px]' },
  },
  {
    accessorKey: 'isencaoTaxa',
    header: 'Isenção Taxa',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={row.original.isencaoTaxa}
          disabled
          aria-label='Isenção'
        />
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[92px] min-w-[92px]' },
  },
  {
    accessorKey: 'comTaxa',
    header: 'Com. Taxa',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={row.original.comTaxa}
          disabled
          aria-label='Com taxa'
        />
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[80px] min-w-[80px]' },
  },
  {
    accessorKey: 'pnp',
    header: 'P.N.P.',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox checked={row.original.pnp} disabled aria-label='P.N.P.' />
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[52px] min-w-[52px]' },
  },
  {
    accessorKey: 'assinado',
    header: 'Assinado',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox checked={row.original.assinado} disabled aria-label='Assinado' />
      </div>
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[76px] min-w-[76px]' },
  },
  {
    accessorKey: 'dataRequisicao',
    header: 'Data',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <span className='block whitespace-nowrap'>{row.original.dataRequisicao || '-'}</span>
    ),
    meta: { align: 'left', width: 'w-[100px] min-w-[100px]' },
  },
  {
    id: 'acoes',
    header: 'Opções',
    cell: () => (
      <div className='flex w-full items-center justify-center gap-1'>
        <Button variant='ghost' size='icon' className='h-8 w-8' title='Documento'>
          <FileText className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
          <Search className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          title='Remover'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center', width: 'w-[120px] min-w-[120px]' },
  },
]

function ExamesSemPapelFilterControls(_: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

export function ExamesSemPapelPage() {
  const queryClient = useQueryClient()
  const closeListagemLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const [searchUtente, setSearchUtente] = useState('')
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [porAssinarActive, setPorAssinarActive] = useState(true)
  const [todosFilter, setTodosFilter] = useState<'todos' | 'efetuados_nao_prescritos'>('todos')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Array<{ id: string; value: string }>>([])
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const contextoQuery = useQuery({
    queryKey: ['exames-sem-papel', 'contexto'],
    queryFn: () => ExamesSemPapelService().getContexto(),
  })

  const tabelaQuery = useQuery({
    queryKey: [
      'exames-sem-papel',
      'tabela',
      page,
      pageSize,
      searchUtente,
      porAssinarActive,
      todosFilter,
      dataInicio?.toISOString() ?? null,
      dataFim?.toISOString() ?? null,
    ],
    queryFn: () =>
      ExamesSemPapelService().getTabela({
        searchUtente: searchUtente.trim() || null,
        dataInicio: dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null,
        dataFim: dataFim ? format(dataFim, 'yyyy-MM-dd') : null,
        porAssinar: porAssinarActive,
        apenasEfetuadosNaoPrescritos: todosFilter === 'efetuados_nao_prescritos',
        pageNumber: page,
        pageSize,
      }),
  })

  const contexto = contextoQuery.data?.info?.data as ExamesSemPapelContextoDTO | undefined
  const rows = useMemo(
    () => (tabelaQuery.data?.info?.data ?? []) as ExameSemPapelTabelaDTO[],
    [tabelaQuery.data]
  )
  const totalRegistos = tabelaQuery.data?.info?.totalCount ?? 0
  const totalPages = tabelaQuery.data?.info?.totalPages ?? 1

  const assinarMutation = useMutation({
    mutationFn: () =>
      ExamesSemPapelService().assinarLote({
        requisicoes: selectedRows,
        areaPrestacao: contexto?.areaPrestacaoAssinarESPDefeito ?? null,
      }),
    onSuccess: (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Operação executada com sucesso.')
        setSelectedRows([])
        queryClient.invalidateQueries({ queryKey: ['exames-sem-papel'] })
        return
      }

      const msg = response.info?.messages?.$?.[0] ?? 'Falha ao assinar em lote.'
      toast.error(msg)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Falha ao assinar em lote.')
    },
  })

  const comunicarMutation = useMutation({
    mutationFn: () =>
      ExamesSemPapelService().comunicarLote({
        requisicoes: selectedRows,
        areaPrestacao: contexto?.areaPrestacaoAssinarESPDefeito ?? null,
      }),
    onSuccess: (response) => {
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Operação executada com sucesso.')
        setSelectedRows([])
        queryClient.invalidateQueries({ queryKey: ['exames-sem-papel'] })
        return
      }

      const msg = response.info?.messages?.$?.[0] ?? 'Falha ao comunicar em lote.'
      toast.error(msg)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Falha ao comunicar em lote.')
    },
  })

  const handleRefresh = () => {
    setSelectedRows([])
    void contextoQuery.refetch()
    void tabelaQuery.refetch()
  }

  const handleExecutarAssinarLote = () => {
    if (!selectedRows.length) {
      return toast.warning('Selecione pelo menos uma requisição.')
    }

    if (!contexto?.temAssinaturaCarregada) {
      return toast.warning('Não existe assinatura digital carregada na sessão atual.')
    }

    assinarMutation.mutate()
  }

  const handleExecutarComunicarLote = () => {
    if (!selectedRows.length) {
      return toast.warning('Selecione pelo menos uma requisição.')
    }

    if (!contexto?.temAssinaturaCarregada) {
      return toast.warning('Não existe assinatura digital carregada na sessão atual.')
    }

    comunicarMutation.mutate()
  }

  return (
    <>
      <PageHead title='Exames Sem Papel | Exames | Área Clínica | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Exames Sem Papel'>
          <div className='mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 pb-3'>
            <div className='flex min-h-8 min-w-0 max-w-[min(55vw,22rem)] shrink-0 items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={closeListagemLikeTabBar}
                title='Voltar'
              >
                <ChevronLeft className='h-5 w-5' aria-hidden />
              </Button>
              <h2 className='truncate text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg'>
                Exames Sem Papel
              </h2>
            </div>

            <div className='flex min-w-0 flex-1 flex-wrap items-center justify-end gap-y-2 gap-x-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='sm' className='h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90'>
                      <Check className='h-4 w-4' />
                      {assinarMutation.isPending || comunicarMutation.isPending ? 'A executar' : 'Executar'}
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={handleExecutarAssinarLote}>
                      Assinar em Lote
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExecutarComunicarLote}>
                      Comunicar em Lote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className='flex items-center gap-2'>
                  <DatePicker value={dataInicio} onChange={setDataInicio} placeholder='Data início' displayFormat='dd-MM-yyyy' className='h-8 w-[130px]' />
                  <DatePicker value={dataFim} onChange={setDataFim} placeholder='Data fim' displayFormat='dd-MM-yyyy' className='h-8 w-[130px]' />
                </div>
              </div>

              <div className='ml-5 flex flex-wrap items-center justify-end gap-2 sm:ml-16'>
                <Input
                  placeholder='Procurar...'
                  value={searchUtente}
                  onChange={(e) => setSearchUtente(e.target.value)}
                  className='h-8 w-[180px] shrink-0 bg-muted/60 sm:w-[200px]'
                />

                <Button
                  size='sm'
                  variant={porAssinarActive ? 'default' : 'outline'}
                  className={`h-8 shrink-0 gap-2 ${porAssinarActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  onClick={() => {
                    setPorAssinarActive((v) => !v)
                    setPage(1)
                  }}
                >
                  <FileText className='h-4 w-4' />
                  Por Assinar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='sm' variant='outline' className='h-8 shrink-0 gap-2'>
                      <Filter className='h-4 w-4' />
                      {todosFilter === 'todos' ? 'Todos' : 'Efetuados Não prescritos'}
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => { setTodosFilter('todos'); setPage(1) }}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setTodosFilter('efetuados_nao_prescritos'); setPage(1) }}>
                      Efetuados Não prescritos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size='sm' variant='outline' className='h-8 shrink-0 gap-2' onClick={handleRefresh}>
                  <RefreshCw className='h-4 w-4' />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

        <DataTable
          columns={columns}
          data={rows}
          pageCount={totalPages}
          totalRows={totalRegistos}
          initialPage={page}
          initialPageSize={pageSize}
          initialFilters={filters}
          initialSorting={sorting}
          selectedRows={selectedRows}
          onRowSelectionChange={setSelectedRows}
          onPaginationChange={(newPage, newPageSize) => {
            setPage(newPage)
            setPageSize(newPageSize)
          }}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters)
            setPage(1)
          }}
          onSortingChange={(newSorting) => setSorting(newSorting)}
          FilterControls={ExamesSemPapelFilterControls}
          hideToolbar
          tableClassName='table-fixed min-w-[1160px]'
        />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
