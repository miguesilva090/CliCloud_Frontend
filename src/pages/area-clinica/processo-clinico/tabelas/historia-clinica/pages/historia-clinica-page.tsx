import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RotateCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { usePageData } from '@/utils/page-data-utils'
import {
  useGetHistoriasClinicasPaginated,
  usePrefetchAdjacentHistoriasClinicas,
} from '../queries/historia-clinica-queries'
import type { HistoriaClinicaTableDTO } from '@/types/dtos/saude/historia-clinica.dtos'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetUtente, useUtentesLight } from '@/pages/utentes/queries/utentes-queries'
import { useDebounce } from 'use-debounce'

const DEFAULT_FILTERS: Array<{ id: string; value: string }> = []
const HistoriaClinicaFilterControls = () => null

const columns: DataTableColumnDef<HistoriaClinicaTableDTO>[] = [
  {
    accessorKey: 'data',
    header: 'Data',
    cell: ({ row }) => {
      const value = row.original.data
      return value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    },
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    cell: ({ row }) => row.original.utenteNome ?? '-',
    meta: { align: 'left', width: 'w-[190px]' },
  },
  {
    accessorKey: 'medicoNome',
    header: 'Médico',
    cell: ({ row }) => row.original.medicoNome ?? '-',
    meta: { align: 'left', width: 'w-[190px]' },
  },
  {
    accessorKey: 'especialidadeNome',
    header: 'Especialidade',
    cell: ({ row }) => row.original.especialidadeNome ?? '-',
    meta: { align: 'left', width: 'w-[170px]' },
  },
  {
    accessorKey: 'obs',
    header: 'História Clínica',
    cell: ({ row }) => (
      <span className='line-clamp-2 break-words' title={row.original.obs ?? '-'}>
        {row.original.obs ?? '-'}
      </span>
    ),
    meta: { align: 'left' },
  },
  {
    accessorKey: 'inativo',
    header: 'Inativo',
    cell: ({ row }) => (row.original.inativo ? 'Sim' : 'Não'),
    meta: { align: 'center', width: 'w-[90px]' },
  },
]

function buildFilters(
  selectedDate: Date | null
): Array<{ id: string; value: string }> {
  const f = [...DEFAULT_FILTERS]
  if (selectedDate) {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    f.push({ id: 'dataInicio', value: dateStr }, { id: 'dataFim', value: dateStr })
  }
  return f
}

export function HistoriaClinicaPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [utenteId, setUtenteId] = useState<string>('')
  const [utenteSearch, setUtenteSearch] = useState<string>('')
  const [utenteModalOpen, setUtenteModalOpen] = useState<boolean>(true)

  const [utenteSearchD] = useDebounce(utenteSearch, 250)
  const utentesLight = useUtentesLight(utenteSearchD)
  const utenteDetalhe = useGetUtente(utenteId)

  const utenteItems =
    (utentesLight.data?.info?.data ?? []).map(
      (u: { id: string; nome: string; numeroUtente?: string | null }) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroUtente ? `Nº Utente: ${u.numeroUtente}` : undefined,
      })
    ) ?? []

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    handleFiltersChange,
    handlePaginationChange,
  } = usePageData({
    useGetDataPaginated: useGetHistoriasClinicasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentHistoriasClinicas,
  })

  useEffect(() => {
    const baseFilters = buildFilters(selectedDate)
    const extraFilters =
      utenteId && utenteId.length > 0
        ? [...baseFilters, { id: 'utenteId', value: utenteId }]
        : baseFilters
    handleFiltersChange(extraFilters)
  }, [selectedDate, utenteId])

  const historias = (data?.info?.data ?? []) as HistoriaClinicaTableDTO[]
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['historias-clinicas-paginated'] })
  }

  const clearDate = () => {
    setSelectedDate(null)
  }

  const handleConfirmUtente = () => {
    setUtenteModalOpen(false)
  }

  const utente = utenteDetalhe.data?.info?.data as
    | {
        numeroUtente?: string | null
        numeroContribuinte?: string | null
        rua?: { nome?: string | null } | null
        numeroPorta?: string | null
        andarRua?: string | null
        codigoPostal?: { localidade?: string | null } | null
        freguesia?: { nome?: string | null; concelho?: { nome?: string | null } | null } | null
        concelho?: { nome?: string | null } | null
        distrito?: { nome?: string | null } | null
      }
    | undefined

  const numeroUtente = utente?.numeroUtente ?? ''
  const numeroContribuinte = utente?.numeroContribuinte ?? ''

  const moradaPartes: string[] = []
  if (utente?.rua?.nome) moradaPartes.push(utente.rua.nome)
  if (utente?.numeroPorta) moradaPartes.push(utente.numeroPorta)
  if (utente?.andarRua) moradaPartes.push(utente.andarRua)
  const morada = moradaPartes.join(' ')

  const localidade =
    utente?.codigoPostal?.localidade ??
    utente?.freguesia?.nome ??
    utente?.freguesia?.concelho?.nome ??
    utente?.concelho?.nome ??
    utente?.distrito?.nome ??
    ''

  return (
    <>
      <PageHead title='História Clínica | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='História Clínica'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar história clínica</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista da história clínica.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <DataTable
            columns={columns}
            data={historias}
            pageCount={pageCount}
            totalRows={totalRows}
            initialPage={page}
            initialPageSize={pageSize}
            initialFilters={filters}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            FilterControls={HistoriaClinicaFilterControls}
            hiddenColumns={[]}
            hideToolbarFilters
            isLoading={isLoading}
            tableClassName='table-fixed min-w-[980px]'
            toolbarEndPrefix={
              <>
                <Button variant='outline' size='sm' onClick={() => setUtenteModalOpen(true)}>
                  Escolher Utente
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'h-8 min-w-[220px] justify-start text-left font-normal'
                      )}
                    >
                      {selectedDate
                        ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })
                        : 'Todas as datas'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={selectedDate ?? undefined}
                      onSelect={(d) => setSelectedDate(d ?? null)}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate ? (
                  <Button variant='outline' size='sm' onClick={clearDate}>
                    Limpar data
                  </Button>
                ) : null}
              </>
            }
            toolbarActions={[
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline',
              },
            ]}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <Dialog open={utenteModalOpen} onOpenChange={setUtenteModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Utentes</DialogTitle>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Nome do Utente
              </label>
              <div className='grid grid-cols-[1fr_auto] gap-2'>
                <AsyncCombobox
                  placeholder='C. Utente...'
                  items={utenteItems}
                  value={utenteId}
                  onChange={(value) => setUtenteId(value)}
                  searchValue={utenteSearch}
                  onSearchValueChange={setUtenteSearch}
                  isLoading={utentesLight.isLoading}
                />
                <Button variant='outline' size='icon' className='h-8 w-8'>
                  +
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Nº Utente
                </label>
                <input
                  className='h-9 w-full rounded-md border border-input bg-muted/40 px-2 text-sm text-muted-foreground'
                  disabled
                  value={numeroUtente}
                  placeholder='Nº Utente'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Nº Contribuinte
                </label>
                <input
                  className='h-9 w-full rounded-md border border-input bg-muted/40 px-2 text-sm text-muted-foreground'
                  disabled
                  value={numeroContribuinte}
                  placeholder='Nº Contribuinte'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Morada
                </label>
                <input
                  className='h-9 w-full rounded-md border border-input bg-muted/40 px-2 text-sm text-muted-foreground'
                  disabled
                  value={morada}
                  placeholder='Morada'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Localidade
                </label>
                <input
                  className='h-9 w-full rounded-md border border-input bg-muted/40 px-2 text-sm text-muted-foreground'
                  disabled
                  value={localidade}
                  placeholder='Localidade'
                />
              </div>
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setUtenteModalOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handleConfirmUtente} disabled={!utenteId}>
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

