import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { List, RotateCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { DataTableAction } from '@/components/shared/data-table'
import { ListagemRecibosTable } from '../components/listagem-recibos-table'
import { ListagemRecibosFilterControls } from '../components/listagem-recibos-filter-controls'
import {
    useGetReciboById,
    useGetRecibosPaginatedPageData,
    usePrefetchAdjacentRecibos,
} from '../queries/recibo-queries'

const ID_FUNCIONALIDADE = 'documentos'

export function ListagemRecibosPage() {
    const queryClient = useQueryClient()
    const[selectedReciboId, setSelectedReciboId] = useState<string | null>(null)

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
            useGetRecibosPaginatedPageData(p, ps, f , s, ID_FUNCIONALIDADE),
        usePrefetchAdjacentData: (p, ps, f, s) => 
            usePrefetchAdjacentRecibos(p, ps, f, s, ID_FUNCIONALIDADE),
    })

    const recibos = data?.info?.data ?? []
    const pageCount = data?.info?.totalPages ?? 0
    const totalRows = data?.info?.totalCount ?? 0
    const errorMessage = 
        error instanceof Error ? error.message : error ? String(error) : ''

    const refresh = () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({
            queryKey: ['recibos'] 
        })
    }

    const toolbarActions: DataTableAction[] = [
        {
            label: 'Listagens',
            icon: <List className='h-4 w-4' />,
            onClick: () => {},
            variant: 'outline',
        },
        {
            label: 'Atualizar',
            icon: <RotateCw className='h-4 w-4' />,
            onClick: refresh,
            variant: 'outline',
        },
    ]

    return (
        <>
            <PageHead title='Recibos | Área Financeira | CliCloud' />
            <DashboardPageContainer>
                <AreaComumListagemPageShell title='Recibos' onRefresh={refresh}>
                {isError ? (
                    <Alert variant='destructive' className='mb-4'>
                        <AlertTitle>Falha ao carregar recibos</AlertTitle>
                        <AlertDescription>
                            {errorMessage || 'Ocorreu um erro ao carregar a lista de recibos'}
                        </AlertDescription>
                    </Alert>
                ) : null}
                <ListagemRecibosTable
                    data={recibos}
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
                    globalSearchColumnId='numeroDocumento'
                    globalSearchPlaceholder='Procurar por n.documento...'
                    FilterControls={ListagemRecibosFilterControls}
                    onOpenView={(row) => setSelectedReciboId(row.id)}
                />

                <ReciboDetailDialog
                    reciboId={selectedReciboId}
                    onOpenChange= {(open)  => {
                        if (!open) setSelectedReciboId(null)
                    }}
                />
                </AreaComumListagemPageShell>
            </DashboardPageContainer>
        </>
    )
}

function ReciboDetailDialog({
    reciboId,
    onOpenChange,
}: {
    reciboId: string | null
    onOpenChange: (open: boolean) => void
}) {
    const {data, isLoading } = useGetReciboById(reciboId ?? '' , ID_FUNCIONALIDADE)
    const recibo = data?.info?.data

    return (
        <Dialog open={!!reciboId} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Detalhes do Recibo</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className='text-sm text-muted-foreground'>A carregar...</div>
                ): !recibo ? (
                    <div className='text-sm text-muted-foreground'>Sem dados para apresentar</div>
                ): (
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div><strong>N. Documento:</strong>{recibo.numeroDocumento}</div>
                        <div><strong>Data:</strong>{recibo.data ? new Date(recibo.data).toLocaleDateString('pt-PT') : '-'}</div>
                        <div><strong>Total do Documento:</strong>{recibo.totalDocumento ?? '-'}</div>
                        <div><strong>Total Líquido:</strong>{recibo.totalLiquido ?? '-'}</div>
                        <div><strong>Liquidado:</strong>{recibo.liquidado ? 'Sim' : 'Não'}</div>
                        <div><strong>Estado:</strong>{recibo.estado ?? '-'}</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}