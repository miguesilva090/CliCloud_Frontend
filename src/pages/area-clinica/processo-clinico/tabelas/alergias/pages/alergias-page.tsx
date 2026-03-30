import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function AlergiasPage() {
  return (
    <>
      <PageHead title='Alergias | CliCloud' />
      <DashboardPageContainer>
        <div className='rounded-2xl border border-border/50 bg-card/60 p-6'>
          <h1 className='text-xl font-bold text-foreground'>Alergias</h1>
          <p className='mt-2 text-muted-foreground'>Tabela de alergias. (Em desenvolvimento)</p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
