import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'

export function EstadosDentariosPage() {
  return (
    <>
      <PageHead title='Estados Dentarios | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard title='Estados Dentários'>
          <p className='text-sm text-muted-foreground'>
            Tabela de estados dentários. (Em desenvolvimento)
          </p>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
