import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import type { ListaEsperaTableDTO } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import { ListagemListaEsperaTable } from '../components/listagem-lista-espera-table'
import { ListaEsperaViewEditModal } from '../modals/lista-espera-view-edit-modal'
import { ListaEsperaObservacoesModal } from '../modals/lista-espera-observacoes-modal'
import {
  invalidateListaEsperaQueries,
  useGetListaEsperaPaginated,
  usePrefetchAdjacentListaEspera,
} from '../queries/listagem-lista-espera-queries'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { isGuid } from '../../marcacoes/utils/marcacoes-agenda-url-prefill'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
} from '@/utils/page-data-utils'

const listPermId = modules.areaAdministrativa.permissions.listaEsperaConsultas.id

export function ListagemListaEsperaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const medicoUrlDoneRef = useRef(false)
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView, canChange, canDelete, canAdd } =
    useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] = useState<ListaEsperaTableDTO | null>(null)
  const [obsOpen, setObsOpen] = useState(false)
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
    useGetDataPaginated: useGetListaEsperaPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentListaEspera,
  })

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => invalidateListaEsperaQueries(queryClient)

  useEffect(() => {
    if (medicoUrlDoneRef.current) return
    const legacyMedico = searchParams.get('c_medico')?.trim() ?? ''
    const medicoId =
      searchParams.get('medicoId')?.trim() ||
      (isGuid(legacyMedico) ? legacyMedico : '')
    if (!medicoId) return
    medicoUrlDoneRef.current = true
    applyFiltersIfChanged(
      filters,
      buildFiltersWithValue(filters, 'medicoAgendaId', medicoId),
      handleFiltersChange
    )
  }, [searchParams, filters, handleFiltersChange])

  const handleDelete = async (row: ListaEsperaTableDTO) => {
    if (!canDelete || row.convertido) return
    if (!window.confirm('Eliminar este registo da lista de espera?')) return
    try {
      const res = await ListaEsperaAdministrativoService(listPermId).delete(row.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Registo eliminado.')
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível eliminar.')
      }
    } catch {
      toast.error('Erro ao eliminar.')
    }
  }

  return (
    <>
      <PageHead title='Lista de Espera | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Lista de Espera'
          onBack={() => {
            closeLikeTabBar()
            navigate('/area-administrativa/consultas/marcacoes')
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar lista de espera</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar os dados.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemListaEsperaTable
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
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
            toolbarActions={[
              ...(canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        setModalMode('create')
                        setSelectedRow(null)
                        setModalOpen(true)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
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
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    if (row.convertido) {
                      toast.error('Registo já convertido — não editável.')
                      return
                    }
                    setModalMode('edit')
                    setSelectedRow(row)
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={canDelete ? handleDelete : undefined}
            renderExtraActions={(row) =>
              canChange && !row.convertido ? (
                <div className='flex gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Observações'
                    onClick={() => {
                      setSelectedRow(row)
                      setObsOpen(true)
                    }}
                  >
                    <MessageSquare className='h-4 w-4' />
                  </Button>
                </div>
              ) : null
            }
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <ListaEsperaViewEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        row={selectedRow}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <ListaEsperaObservacoesModal
        open={obsOpen}
        onOpenChange={setObsOpen}
        listaEsperaId={selectedRow?.id ?? null}
        utenteLabel={selectedRow?.utenteNome ?? undefined}
        listPermId={listPermId}
        onSaved={refresh}
      />
    </>
  )
}
