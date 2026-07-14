import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw } from 'lucide-react'
import { usePageData, type PageFilter } from '@/utils/page-data-utils'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { ListagemSubsistemasServicosTable } from './listagem-subsistemas-servicos-table'
import {
  useGetSubsistemasServicosPaginated,
  usePrefetchAdjacentSubsistemasServicos,
} from '../queries/listagem-subsistemas-servicos-queries'
import { SubsistemaServicoViewCreateModal } from '../modals/subsistema-servico-view-create-modal'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { useScopedFuncionalidadeId } from '@/hooks/use-scoped-funcionalidade-id'
import { modules } from '@/config/modules'

const EmptyFilterControls: ComponentType<{
  table: unknown
  columns: unknown[]
  onApplyFilters: () => void
  onClearFilters: () => void
}> = () => null

/** Modo picker: checkboxes + enviar linhas seleccionadas ao formulário de origem. */
export type SubsistemasServicosPickerSelecao = {
  submitLabel: string
  onSubmit: (rows: SubsistemaServicoTableDTO[]) => void
}

export type ListagemSubsistemasServicosPanelProps = {
  organismoIdFromUrl?: string
  /** Dentro de Dialog (Nova admissão): sem seta Voltar no shell, cartão mais neutro. */
  embedded?: boolean
  /** Fluxo picker: voltar sem `navigate()` SPA (evita ecrã preso). */
  onBack?: () => void
  pickerSelecao?: SubsistemasServicosPickerSelecao
}

/**
 * Listagem completa (CRUD + tabela) reutilizada na página de tabelas e no fluxo Nova admissão (modal).
 */
export function ListagemSubsistemasServicosPanel({
  organismoIdFromUrl,
  embedded = false,
  onBack,
  pickerSelecao,
}: ListagemSubsistemasServicosPanelProps) {
  const defaultFilters = useMemo((): PageFilter[] | undefined => {
    if (!organismoIdFromUrl) return undefined
    return [{ id: 'organismoId', value: organismoIdFromUrl }]
  }, [organismoIdFromUrl])

  const subsistemasServicosPermId = useScopedFuncionalidadeId(
    modules.areaComum.permissions.subsistemasServicos.id,
    modules.areaAdministrativa.permissions.subsistemaServicos.id
  )
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(subsistemasServicosPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] = useState<SubsistemaServicoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SubsistemaServicoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedById, setSelectedById] = useState<Map<string, SubsistemaServicoTableDTO>>(
    () => new Map()
  )

  useEffect(() => {
    setSelectedById(new Map())
  }, [organismoIdFromUrl, pickerSelecao])

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
      useGetSubsistemasServicosPaginated(p, ps, f, s, organismoIdFromUrl),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentSubsistemasServicos(p, ps, f, null),
    defaultFilters,
  })

  const subsistemas = (data?.info?.data ?? []) as SubsistemaServicoTableDTO[]
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const abrirModalNovo = () => {
    setSelectedRow(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: abrirModalNovo,
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
      variant: 'outline' as const,
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-paginated'] })
      },
      variant: 'outline' as const,
    },
  ]

  const handleOpenView = (row: SubsistemaServicoTableDTO) => {
    setSelectedRow(row)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleOpenEdit = (row: SubsistemaServicoTableDTO) => {
    setSelectedRow(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleOpenDelete = (row: SubsistemaServicoTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return

    setIsDeleting(true)
    try {
      const response = await SubsistemaServicoService().deleteSubsistemaServico(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Subsistema de Serviço eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-paginated'] })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Subsistema de Serviço.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Subsistema de Serviço.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const selectedIdsOnPage = useMemo(
    () => subsistemas.filter((r) => selectedById.has(r.id)).map((r) => r.id),
    [subsistemas, selectedById]
  )

  const handleRowSelectionChange = (idsOnPage: string[]) => {
    setSelectedById((prev) => {
      const next = new Map(prev)
      const pageIds = new Set(subsistemas.map((r) => r.id))
      for (const id of pageIds) {
        if (!idsOnPage.includes(id)) next.delete(id)
      }
      for (const id of idsOnPage) {
        const row = subsistemas.find((r) => r.id === id)
        if (row) next.set(id, row)
      }
      return next
    })
  }

  const handleEnviarSelecao = () => {
    if (!pickerSelecao) return
    const rows = Array.from(selectedById.values()).filter((r) => !r.inativo)
    if (rows.length === 0) {
      toast.error('Seleccione pelo menos um subsistema de serviço.')
      return
    }
    pickerSelecao.onSubmit(rows)
    setSelectedById(new Map())
  }

  const selectionCount = selectedById.size

  const headerTrailing = pickerSelecao ? (
      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-xs text-muted-foreground sm:text-sm'>
          {selectionCount} seleccionado(s)
        </span>
        <Button
          type='button'
          size='sm'
          disabled={selectionCount === 0}
          onClick={handleEnviarSelecao}
        >
          {pickerSelecao.submitLabel}
        </Button>
      </div>
    ) : undefined

  return (
    <>
      {isError ? (
        <Alert variant='destructive' className='mb-4'>
          <AlertTitle>Falha ao carregar Subsistemas de Serviços</AlertTitle>
          <AlertDescription>
            {errorMessage || 'Ocorreu um erro ao pedir a lista de Subsistemas de Serviços.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <AreaComumListagemPageShell
        title='Subsistemas de Serviços'
        showBackButton={!embedded}
        onBack={onBack}
        headerTrailing={headerTrailing}
        cardClassName={embedded ? 'border-0 shadow-none' : undefined}
        onRefresh={() => {
          handleFiltersChange([])
          handlePaginationChange(1, pageSize)
          queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-paginated'] })
        }}
      >
        <ListagemSubsistemasServicosTable
          data={subsistemas}
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
          globalSearchColumnId='servicoId'
          globalSearchPlaceholder='Procurar...'
          FilterControls={EmptyFilterControls}
          onOpenView={(row) => {
            if (!canView) return
            handleOpenView(row)
          }}
          onOpenEdit={canChange ? handleOpenEdit : undefined}
          onOpenDelete={canDelete ? handleOpenDelete : undefined}
          canView={canView}
          canChange={canChange}
          canDelete={canDelete}
          selectedRows={pickerSelecao ? selectedIdsOnPage : undefined}
          onRowSelectionChange={pickerSelecao ? handleRowSelectionChange : undefined}
        />

        <SubsistemaServicoViewCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          viewData={selectedRow}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ['subsistemas-servicos-paginated'] })
          }
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Subsistema de Serviço</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o Subsistema de Serviço com serviço &quot;
                {itemToDelete?.servicoId ?? ''}
                &quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  void handleConfirmDelete()
                }}
                disabled={isDeleting}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {isDeleting ? 'A eliminar...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AreaComumListagemPageShell>
    </>
  )
}
