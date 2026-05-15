import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RotateCw, List, ListTodo, Archive, ClipboardList, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
} from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { SinistradoService } from '@/lib/services/sinistrados/sinistrado-service'
import type { SinistradoTableDTO } from '@/types/dtos/sinistrados/sinistrado.dtos'
import { ListagemSinistradosTable } from '../components/listagem-sinistrados-table'
import { SinistradoViewEditModal } from '../modals/sinistrado-view-edit-modal'
import {
  useGetSinistradosPaginated,
  usePrefetchAdjacentSinistrados,
} from '../queries/listagem-sinistrados-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openSinistradoCreationInApp } from '@/utils/window-utils'

const listPermId = modules.areaAdministrativa.permissions.sinistrados.id
const createPermId = modules.areaAdministrativa.permissions.registoSinistrados.id

export function ListagemSinistradosPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canChange, canDelete } = useAreaComumEntityListPermissions(listPermId)
  const { canAdd } = useAreaComumEntityListPermissions(createPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] = useState<SinistradoTableDTO | null>(null)
  const [autoOpenSection, setAutoOpenSection] = useState<'observacoes' | 'relatorio' | null>(
    null
  )
  const [historicoAtivo, setHistoricoAtivo] = useState(false)
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
  } =
    usePageData({
      useGetDataPaginated: useGetSinistradosPaginated,
      usePrefetchAdjacentData: usePrefetchAdjacentSinistrados,
    })
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['sinistrados-paginated'] })

  const toggleHistorico = () => {
    setHistoricoAtivo((prev) => {
      const next = !prev
      applyFiltersIfChanged(
        filters,
        buildFiltersWithValue(filters, 'historico', next ? '1' : '0'),
        handleFiltersChange
      )
      return next
    })
  }

  return (
    <>
      <PageHead title='Sinistrados | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Sinistrados'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar sinistrados</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista de sinistrados.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemSinistradosTable
            data={data?.info?.data ?? []}
            isLoading={isLoading}
            pageCount={data?.info?.totalPages ?? 0}
            totalRows={data?.info?.totalCount ?? 0}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={[
              ...(canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        openSinistradoCreationInApp(navigate, addWindow)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
              {
                label: historicoAtivo ? 'Histórico x' : 'Histórico',
                icon: <Archive className='h-4 w-4' />,
                onClick: toggleHistorico,
                variant: historicoAtivo ? ('emerald' as const) : ('outline' as const),
              },
              {
                label: 'Listagens',
                icon: <List className='h-4 w-4' />,
                onClick: () => {},
                variant: 'outline' as const,
              },
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
            onOpenView={(row) => {
              setModalMode('view')
              setSelectedRow(row)
              setAutoOpenSection(null)
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setModalMode('edit')
                    setSelectedRow(row)
                    setAutoOpenSection(null)
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={
              canDelete
                ? async (row) => {
                    if (!row?.id) return
                    const response = await SinistradoService(listPermId).delete(row.id)
                    if (response.info.status === ResponseStatus.Success) {
                      toast.success('Sinistrado eliminado.')
                      refresh()
                    }
                  }
                : undefined
            }
            renderExtraActions={(row) => (
              canChange ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      title='Ações'
                    >
                      <ListTodo className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={async () => {
                        const response = await SinistradoService(listPermId).moveToHistory(row.id)
                        if (response.info.status === ResponseStatus.Success) {
                          toast.success('Movido para histórico.')
                          refresh()
                        }
                      }}
                    >
                        <Archive className='mr-2 h-4 w-4' />
                      Histórico
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setModalMode('edit')
                        setSelectedRow(row)
                        setAutoOpenSection('observacoes')
                        setModalOpen(true)
                      }}
                    >
                      <ClipboardList className='mr-2 h-4 w-4' />
                      Observações
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setModalMode('edit')
                        setSelectedRow(row)
                        setAutoOpenSection('relatorio')
                        setModalOpen(true)
                      }}
                    >
                      <FileText className='mr-2 h-4 w-4' />
                      Relatório
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null
            )}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />
          <SinistradoViewEditModal
            open={modalOpen}
            onOpenChange={(next) => {
              setModalOpen(next)
              if (!next) {
                setAutoOpenSection(null)
              }
            }}
            mode={modalMode}
            viewData={selectedRow}
            onSuccess={refresh}
            autoOpenSection={autoOpenSection}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
