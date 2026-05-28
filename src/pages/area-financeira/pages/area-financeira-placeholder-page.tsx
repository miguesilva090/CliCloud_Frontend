import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

type AreaFinanceiraPlaceholderPageProps = {
  title: string
}

export function AreaFinanceiraPlaceholderPage({
  title,
}: AreaFinanceiraPlaceholderPageProps) {
  return (
    <>
      <PageHead title={`${title} | Área Financeira`} />
      <DashboardPageContainer>
        <div className='min-h-[50vh] p-4 text-sm text-muted-foreground'>
          {title} em preparação.
        </div>
      </DashboardPageContainer>
    </>
  )
}
