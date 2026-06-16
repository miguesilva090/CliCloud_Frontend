import { usePageData } from '@/utils/page-data-utils'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { PageHead } from '@/components/shared/page-head'
import { DistritosTable } from '../components/distritos-table/distritos-table'
import {
  useGetDistritosPaginated,
  usePrefetchAdjacentDistritos,
} from '../queries/distritos-queries'

export function DistritosPage() {
  const {
    data,
    isLoading,
    page,
    pageSize,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetDistritosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentDistritos,
  })

  const distritos = data?.info?.data || []
  const totalDistritos = data?.info?.totalCount || 0
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
      <PageHead title='Distritos | Luma' />
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
        ]}
      />
      <div className='mt-10'>
        <DistritosTable
          distritos={distritos}
          page={page}
          pageSize={pageSize}
          total={totalDistritos}
          pageCount={pageCount}
          onFiltersChange={handleFiltersChange}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
