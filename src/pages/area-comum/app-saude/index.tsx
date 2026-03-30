import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function AppSaudePage() {
  return (
    <>
      <PageHead title='App de Saúde | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
          <p className='text-muted-foreground'>App de Saúde — em desenvolvimento.</p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
