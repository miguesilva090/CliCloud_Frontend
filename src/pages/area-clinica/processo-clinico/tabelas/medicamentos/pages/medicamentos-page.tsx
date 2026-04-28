import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'

export function MedicamentosPage() {
  return (
    <>
      <PageHead title='Medicamentos | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard title='Medicamentos'>
          <p className='text-sm text-muted-foreground'>
            Tabela de medicamentos. (Em desenvolvimento)
          </p>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
