import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  X,
  Plus,
  RotateCw,
  List,
  FileSpreadsheet,
} from 'lucide-react'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openMedicoCreationInApp } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData } from '@/utils/page-data-utils'
import {
  MEDICO_LIST_ALLOWED_SORT_IDS,
  useGetMedicosPaginated,
  usePrefetchAdjacentMedicos,
} from '@/pages/medicos/queries/medicos-queries'
import type { DataTableAction } from '@/components/shared/data-table'
import { MedicosTable } from '@/pages/medicos/components/medicos-table/medicos-table'
import { listagemMedicosColumns } from '../components/listagem-medicos-columns'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const medicosPermId = modules.areaComum.permissions.medicos.id

export function ListagemMedicosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canAdd } = useAreaComumEntityListPermissions(medicosPermId)

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
    useGetDataPaginated: (p, ps, f, s) => useGetMedicosPaginated(p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) => usePrefetchAdjacentMedicos(p, ps, f),
  })

  useEffect(() => {
    const cleaned = sorting.filter((s) =>
      MEDICO_LIST_ALLOWED_SORT_IDS.has(s.id)
    )
    const same =
      cleaned.length === sorting.length &&
      cleaned.every(
        (s, i) => s.id === sorting[i]?.id && s.desc === sorting[i]?.desc
      )
    if (!same) {
      handleSortingChange(cleaned)
    }
  }, [sorting, handleSortingChange])

  const medicos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => openMedicoCreationInApp(navigate, addWindow),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
      : []),
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
      },
      variant: 'outline',
    },
    {
      label: 'Excel',
      icon: <FileSpreadsheet className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
            title='Médicos'
            onRefresh={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({ queryKey: ['medicos-paginated'] })
            }}
        >

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar médicos</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de médicos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <MedicosTable
          data={medicos}
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
          columns={listagemMedicosColumns}
          toolbarActions={toolbarActions}
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar...'
        />
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
    </>
  )
}
