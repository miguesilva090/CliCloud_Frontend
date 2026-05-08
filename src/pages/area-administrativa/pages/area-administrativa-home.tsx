import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

export function AreaAdministrativaHomePage() {
  return (
    <>
      <PageHead title='Consultas | Área Administrativa' />
      <DashboardPageContainer>
        <div className='min-h-[50vh]' />
      </DashboardPageContainer>
    </>
  )
}