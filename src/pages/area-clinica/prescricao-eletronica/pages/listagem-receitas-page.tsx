import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FilePlus, RotateCw } from 'lucide-react'
import { toast } from '@/utils/toast-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { PageHead } from '@/components/shared/page-head'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataTableAction } from '@/components/shared/data-table'
import { usePageData } from '@/utils/page-data-utils'
import { ResponseStatus } from '@/types/api/responses'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { ReceitaMedicaService } from '@/lib/services/prescricao/receita-medica-service'
import type { ReceitaMedicaTableDTO } from '@/types/dtos/prescricao/receita-medica.dtos'
import {
  useGetReceitasPaginated,
  usePrefetchAdjacentReceitas,
} from '../queries/listagem-receitas-queries'
import { ListagemReceitasTable } from '../components/listagem-receitas-table'
import { AnularReceitaModal } from '../modals/anular-receita-modal'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function ListagemReceitasPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(permissionId)

  const [anularOpen, setAnularOpen] = useState(false)
  const [itemToAnular, setItemToAnular] = useState<ReceitaMedicaTableDTO | null>(
    null
  )
  const [isAnulando, setIsAnulando] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetReceitasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentReceitas,
  })

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Nova Receita',
            icon: <FilePlus className='h-4 w-4' />,
            onClick: () =>
              openPathInApp(
                navigate,
                addWindow,
                '/area-clinica/prescricao-eletronica/nova',
                'Nova Receita'
              ),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
      : []),
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({
          queryKey: ['receitas-medicas-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenView = (row: ReceitaMedicaTableDTO) => {
    openPathInApp(
      navigate,
      addWindow,
      `/area-clinica/prescricao-eletronica/${row.id}`,
      'Receita'
    )
  }

  const handleOpenEdit = (row: ReceitaMedicaTableDTO) => {
    openPathInApp(
      navigate,
      addWindow,
      `/area-clinica/prescricao-eletronica/${row.id}`,
      'Editar Receita'
    )
  }

  const handleOpenAnular = (row: ReceitaMedicaTableDTO) => {
    setItemToAnular(row)
    setAnularOpen(true)
  }

  const handleConfirmAnular = async (payload: {
    motivoCodigo: string
    motivoDescricao: string
  }) => {
    if (!itemToAnular?.id) return
    setIsAnulando(true)
    try {
      const response = await ReceitaMedicaService(permissionId).anular(
        itemToAnular.id,
        payload
      )
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Receita anulada com sucesso.')
        setAnularOpen(false)
        setItemToAnular(null)
        queryClient.invalidateQueries({
          queryKey: ['receitas-medicas-paginated'],
        })
      } else {
        toast.error(
          response.info?.messages?.['$']?.[0] ?? 'Falha ao anular receita.'
        )
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast.error(e?.message ?? 'Ocorreu um erro ao anular a receita.')
    } finally {
      setIsAnulando(false)
    }
  }

  return (
    <>
      <PageHead title='Prescrição eletrónica | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Prescrição eletrónica'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar receitas</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de receitas.'}
              </AlertDescription>
            </Alert>
          ) : null}
          <ListagemReceitasTable
            data={rows}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            onOpenView={canView ? handleOpenView : undefined}
            onOpenEdit={canChange ? handleOpenEdit : undefined}
            onOpenAnular={canDelete ? handleOpenAnular : undefined}
            rowActionPermissions={{ canView, canChange, canDelete }}
            toolbarActions={toolbarActions}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <AnularReceitaModal
        open={anularOpen}
        onOpenChange={setAnularOpen}
        isSubmitting={isAnulando}
        onConfirm={handleConfirmAnular}
      />
    </>
  )
}
