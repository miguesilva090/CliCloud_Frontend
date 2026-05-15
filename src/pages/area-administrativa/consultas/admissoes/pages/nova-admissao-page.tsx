import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AdmissaoViewEditModal } from '../modals/admissao-view-edit-modal'

export function NovaAdmissaoPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Nova admissão | CliCloud' />
      <DashboardPageContainer>
        <AdmissaoViewEditModal
          open
          renderAsPage
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeWindowTab()
            }
          }}
          mode='create'
          row={null}
          onSaved={closeWindowTab}
        />
      </DashboardPageContainer>
    </>
  )
}
