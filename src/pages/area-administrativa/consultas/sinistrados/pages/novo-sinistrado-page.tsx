import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { SinistradoViewEditModal } from '../modals/sinistrado-view-edit-modal'

export function NovoSinistradoPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Novo Sinistrado | CliCloud' />
      <DashboardPageContainer>
        <SinistradoViewEditModal
          open
          renderAsPage
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeWindowTab()
            }
          }}
          mode='create'
          viewData={null}
          onSuccess={closeWindowTab}
        />
      </DashboardPageContainer>
    </>
  )
}
