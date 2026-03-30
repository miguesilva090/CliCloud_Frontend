import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function AjudaPage() {
  return (
    <>
      <PageHead title='Ajuda | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
          <p className='text-muted-foreground'>Ajuda — em desenvolvimento.</p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
