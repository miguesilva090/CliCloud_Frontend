import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function ProcessoClinicoPage() {
  return (
    <>
      <PageHead title='Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
          <div className='p-4 rounded-full bg-muted/50 border border-border/50 mb-4' />
        </div>
      </DashboardPageContainer>
    </>
  )
}
