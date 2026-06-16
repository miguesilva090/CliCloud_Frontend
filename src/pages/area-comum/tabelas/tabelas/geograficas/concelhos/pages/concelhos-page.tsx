import { usePageData } from '@/utils/page-data-utils'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { PageHead } from '@/components/shared/page-head'
import { ConcelhosTable } from '../components/concelhos-table/concelhos-table'
import {
  useGetConcelhosPaginated,
  usePrefetchAdjacentConcelhos,
} from '../queries/concelhos-queries'

export function ConcelhosPage() {
  const {
    data,
    isLoading,
    page,
    pageSize,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetConcelhosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentConcelhos,
  })

  const concelhos = data?.info?.data || []
  const totalConcelhos = data?.info?.totalCount || 0
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
      <PageHead title='Concelhos | Luma' />
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
        ]}
      />
      <div className='mt-10'>
        <ConcelhosTable
          concelhos={concelhos}
          page={page}
          pageSize={pageSize}
          total={totalConcelhos}
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

