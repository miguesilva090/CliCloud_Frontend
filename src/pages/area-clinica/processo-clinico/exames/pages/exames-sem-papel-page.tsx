import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import {
  Check,
  ChevronDown,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
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
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label={`Selecionar ${row.original.requisicaoNum}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center', width: 'w-[40px]' },
  },
  {
    accessorKey: 'requisicaoNum',
    header: 'Requisição Nº',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.requisicaoNum || '-',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'utente',
    header: 'Utente',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.utente || '-',
    meta: { align: 'left', width: 'w-[220px]' },
  },
  {
    accessorKey: 'area',
    header: 'Área',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.area || '-',
    meta: { align: 'left', width: 'w-[50px]' },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.estado || '-',
    meta: { align: 'left', width: 'w-[95px]' },
  },
  {
    accessorKey: 'lotes',
    header: 'Lotes',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <Checkbox checked={row.original.lotes} disabled aria-label='Lotes' />
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[55px]' },
  },
  {
    accessorKey: 'medico',
    header: 'Médico',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.medico || '-',
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'isencaoTaxa',
    header: 'Isenção Taxa',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <Checkbox
        checked={row.original.isencaoTaxa}
        disabled
        aria-label='Isenção'
      />
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[85px]' },
  },
  {
    accessorKey: 'comTaxa',
    header: 'Com. Taxa',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <Checkbox
        checked={row.original.comTaxa}
        disabled
        aria-label='Com taxa'
      />
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[75px]' },
  },
  {
    accessorKey: 'pnp',
    header: 'P.N.P.',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <Checkbox checked={row.original.pnp} disabled aria-label='P.N.P.' />
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[55px]' },
  },
  {
    accessorKey: 'assinado',
    header: 'Assinado',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) => (
      <Checkbox checked={row.original.assinado} disabled aria-label='Assinado' />
    ),
    enableSorting: false,
    meta: { align: 'center', width: 'w-[75px]' },
  },
  {
    accessorKey: 'dataRequisicao',
    header: 'Data',
    cell: ({ row }: CellContext<ExameSemPapelTabelaDTO, unknown>) =>
      row.original.dataRequisicao || '-',
    meta: { align: 'left', width: 'w-[90px]' },
  },
  {
    id: 'acoes',
    header: 'Opções',
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
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
    meta: { align: 'right', width: 'w-[90px]' },
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
      <PageHead title='Exames Sem Papel | CliCloud' />
      <DashboardPageContainer>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-foreground'>Exames Sem Papel</h1>
        </div>

        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex shrink-0 items-center'>
            <Input
              placeholder='Procurar...'
              value={searchUtente}
              onChange={(e) => setSearchUtente(e.target.value)}
              className='h-8 w-[180px] sm:w-[200px] bg-muted/60'
            />
          </div>
          <div className='flex flex-1 justify-center items-center gap-3 min-w-0'>
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
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            <Button
              size='sm'
              variant={porAssinarActive ? 'default' : 'outline'}
              className={`h-8 gap-2 ${porAssinarActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
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
                <Button size='sm' variant='outline' className='h-8 gap-2 border-dashed'>
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
            <Button size='sm' variant='outline' className='h-8 gap-2' onClick={handleRefresh}>
              <RefreshCw className='h-4 w-4' />
              Atualizar
            </Button>
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
        />
      </DashboardPageContainer>
    </>
  )
}
