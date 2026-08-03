import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RotateCw, Search } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePageData, buildFiltersWithValue } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { ModoListagemTratamentoMarcados } from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'
import type { TratamentoMarcadosTableDTO } from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'
import { ListagemTratamentosMarcadosTable } from '../components/listagem-tratamentos-marcados-table'
import { buildTratamentosMarcadosColumns } from '../components/listagem-tratamentos-marcados-table.columns'
import {
  invalidateTratamentosMarcadosQueries,
  useGetTratamentosMarcadosPaginated,
  usePrefetchAdjacentTratamentosMarcados,
} from '../queries/listagem-tratamentos-marcados-queries'
import type { DataTableAction } from '@/components/shared/data-table'
import { SelecionarLocalTratamentoModal } from '../../admissoes/modals/selecionar-local-tratamento-modal'
import { SelecionarUtenteTratamentoModal } from '../modals/selecionar-utente-tratamento-modal'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

const TITLE: Record<ModoListagemTratamentoMarcados, string> = {
  [ModoListagemTratamentoMarcados.Marcados]: 'Tratamentos — Marcados/Iniciados',
  [ModoListagemTratamentoMarcados.PorLocal]:
    'Tratamentos — Por Local de Tratamento',
  [ModoListagemTratamentoMarcados.PorUtente]: 'Tratamentos — Por Utente',
}

export function ListagemTratamentosMarcadosPage({
  modo = ModoListagemTratamentoMarcados.Marcados,
}: {
  modo?: ModoListagemTratamentoMarcados
}) {
  const navigate = useNavigate()
  const { canView, canDelete, canAdd, canChange } =
    useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const isModoLocal = modo === ModoListagemTratamentoMarcados.PorLocal
  const isModoUtente = modo === ModoListagemTratamentoMarcados.PorUtente
  const [localModalOpen, setLocalModalOpen] = useState(false)
  const [utenteModalOpen, setUtenteModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rowToDelete, setRowToDelete] =
    useState<TratamentoMarcadosTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, f, s) =>
      useGetTratamentosMarcadosPaginated(modo, p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentTratamentosMarcados(modo, p, ps, f),
  })

  const localId =
    filters.find((f) => f.id === 'localTratamentoId')?.value ?? ''
  const utenteId = filters.find((f) => f.id === 'utenteId')?.value ?? ''

  useEffect(() => {
    if (isModoLocal && !localId) setLocalModalOpen(true)
  }, [isModoLocal, localId])

  useEffect(() => {
    if (isModoUtente && !utenteId) setUtenteModalOpen(true)
  }, [isModoUtente, utenteId])

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const applyLocal = (id: string) => {
    handleFiltersChange(
      buildFiltersWithValue(filters, 'localTratamentoId', id)
    )
    handlePaginationChange(1, pageSize)
  }

  const applyUtente = (id: string) => {
    handleFiltersChange(buildFiltersWithValue(filters, 'utenteId', id))
    handlePaginationChange(1, pageSize)
  }

  const refresh = () => invalidateTratamentosMarcadosQueries(queryClient)

  const handleOpenView = (row: TratamentoMarcadosTableDTO) => {
    navigate(`/area-administrativa/tratamentos/marcados/${row.id}`)
  }

  const handleOpenDelete = (row: TratamentoMarcadosTableDTO) => {
    if (!canDelete) return
    setRowToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = (open: boolean) => {
    setDeleteDialogOpen(open)
    if (!open) setRowToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return
    setIsDeleting(true)
    try {
      const res = await TratamentoService(listPermId).delete(rowToDelete.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Registo eliminado.')
        setDeleteDialogOpen(false)
        setRowToDelete(null)
        refresh()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível eliminar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao eliminar.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isModoMarcados = modo === ModoListagemTratamentoMarcados.Marcados

  const toolbarActions: DataTableAction[] = [
    ...(isModoMarcados && (canAdd || canChange)
      ? [
          {
            label: 'Novo',
            icon: <Plus className='h-4 w-4' />,
            onClick: () =>
              navigate('/area-administrativa/tratamentos/marcacoes-manuais'),
            variant: 'destructive' as const,
          },
        ]
      : []),
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: refresh,
      variant: 'outline',
    },
    ...(isModoLocal
      ? [
          {
            label: 'Nova pesquisa',
            icon: <Search className='h-4 w-4' />,
            onClick: () => setLocalModalOpen(true),
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(isModoUtente
      ? [
          {
            label: 'Nova pesquisa',
            icon: <Search className='h-4 w-4' />,
            onClick: () => setUtenteModalOpen(true),
            variant: 'outline' as const,
          },
        ]
      : []),
  ]

  const columns = buildTratamentosMarcadosColumns(
    handleOpenView,
    canDelete ? handleOpenDelete : undefined,
    { canView, canChange: false, canDelete }
  )

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Não tem permissão para ver tratamentos marcados.
          </AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title={`${TITLE[modo]} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={TITLE[modo]} onRefresh={refresh}>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar tratamentos</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Erro ao pedir a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemTratamentosMarcadosTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      {isModoLocal ? (
        <SelecionarLocalTratamentoModal
          open={localModalOpen}
          onOpenChange={setLocalModalOpen}
          initialLocalId={localId}
          onConfirm={applyLocal}
        />
      ) : null}

      {isModoUtente ? (
        <SelecionarUtenteTratamentoModal
          open={utenteModalOpen}
          onOpenChange={setUtenteModalOpen}
          initialUtenteId={utenteId}
          onConfirm={applyUtente}
        />
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja realmente apagar o registo?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
            >
              {isDeleting ? 'A apagar…' : 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ListagemTratamentosMarcadosPorLocalPage() {
  return (
    <ListagemTratamentosMarcadosPage
      modo={ModoListagemTratamentoMarcados.PorLocal}
    />
  )
}

export function ListagemTratamentosMarcadosPorUtentePage() {
  return (
    <ListagemTratamentosMarcadosPage
      modo={ModoListagemTratamentoMarcados.PorUtente}
    />
  )
}