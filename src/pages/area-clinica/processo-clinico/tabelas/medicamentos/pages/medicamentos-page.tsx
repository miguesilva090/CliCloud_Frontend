import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function MedicamentosPage() {
  return (
    <>
      <PageHead title='Medicamentos | CliCloud' />
      <DashboardPageContainer>
        <div className='rounded-2xl border border-border/50 bg-card/60 p-6'>
          <h1 className='text-xl font-bold text-foreground'>Medicamentos</h1>
          <p className='mt-2 text-muted-foreground'>Tabela de medicamentos. (Em desenvolvimento)</p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
