import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

export function AreaFinanceiraHomePage() {
  return (
    <>
      <PageHead title='Área Financeira' />
      <DashboardPageContainer>
        <div className='min-h-[50vh]' />
      </DashboardPageContainer>
    </>
  )
}
