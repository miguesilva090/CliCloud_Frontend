import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

export function TratamentosAdminPlaceholderPage() {
  return (
    <>
      <PageHead title='Tratamentos | Área Administrativa' />
      <DashboardPageContainer>
        <div className='min-h-[50vh]' />
      </DashboardPageContainer>
    </>
  )
}
