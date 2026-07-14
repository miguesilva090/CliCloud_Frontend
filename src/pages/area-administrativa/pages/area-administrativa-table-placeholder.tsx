import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

type AreaAdministrativaTablePlaceholderPageProps = {
  title: string
}

export function AreaAdministrativaTablePlaceholderPage({
  title,
}: AreaAdministrativaTablePlaceholderPageProps) {
  return (
    <>
      <PageHead title={`${title} | Área Administrativa`} />
      <DashboardPageContainer>
        <div className='min-h-[50vh]' />
      </DashboardPageContainer>
    </>
  )
}
