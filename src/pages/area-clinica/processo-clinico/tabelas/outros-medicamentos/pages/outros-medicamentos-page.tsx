import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'

export function OutrosMedicamentosPage() {
  return (
    <>
      <PageHead title='Outros Medicamentos | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard title='Outros Medicamentos'>
          <p className='text-sm text-muted-foreground'>
            Tabela de outros medicamentos. (Em desenvolvimento)
          </p>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
