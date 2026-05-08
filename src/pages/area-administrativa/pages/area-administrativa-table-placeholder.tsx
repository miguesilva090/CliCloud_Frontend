import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

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
        <div className='min-h-[50vh] p-4 text-sm text-muted-foreground'>
          {title} em preparação.
        </div>
      </DashboardPageContainer>
    </>
  )
}
