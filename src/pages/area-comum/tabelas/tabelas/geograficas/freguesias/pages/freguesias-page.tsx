import { usePageData } from '@/utils/page-data-utils'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { PageHead } from '@/components/shared/page-head'
import { ListagemFreguesiasTable } from '../components/listagem-freguesias-table'
import { ListagemFreguesiasFilterControls } from '../components/listagem-freguesias-filter-controls'
import {
  useGetFreguesiasPaginated,
  usePrefetchAdjacentFreguesias,
} from '../queries/listagem-freguesias-queries'

export function FreguesiasPage() {
  const {
    data,
    isLoading,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetFreguesiasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentFreguesias,
  })

  const freguesias = data?.info?.data || []
  const totalFreguesias = data?.info?.totalCount || 0
  const pageCount = data?.info?.totalPages || 0

  if (isLoading) {
    return (
      <div className='px-4 md:px-8 md:pb-8 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
        <DataTableSkeleton
          columnCount={6}
          filterableColumnCount={2}
          searchableColumnCount={1}
        />
      </div>
    )
  }

  return (
    <div className='px-4 md:px-8 md:pb-8 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
      <PageHead title='Freguesias | Luma' />
      <Breadcrumbs
        items={[
          {
            title: 'Geográficas',
            link: '/utilitarios/tabelas/geograficas',
          },
          {
            title: 'Países',
            link: '/utilitarios/tabelas/geograficas/paises',
          },
          {
            title: 'Distritos',
            link: '/utilitarios/tabelas/geograficas/distritos',
          },
          {
            title: 'Concelhos',
            link: '/utilitarios/tabelas/geograficas/concelhos',
          },
          {
            title: 'Freguesias',
            link: '/utilitarios/tabelas/geograficas/freguesias',
          },
        ]}
      />
      <div className='mt-10'>
        <ListagemFreguesiasTable
          data={freguesias}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalFreguesias}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onFiltersChange={handleFiltersChange}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          FilterControls={ListagemFreguesiasFilterControls}
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar por nome...'
        />
      </div>
    </div>
  )
}
