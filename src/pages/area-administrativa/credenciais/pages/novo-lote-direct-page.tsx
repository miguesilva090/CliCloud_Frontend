import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { LoteDirectFormModal } from '../modals/lote-direct-form-modal'

export function NovoLoteDirectPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Lançamento de Credenciais | CliCloud' />
      <DashboardPageContainer>
        <LoteDirectFormModal
          open
          renderAsPage
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeWindowTab()
            }
          }}
          mode='create'
          onSuccess={closeWindowTab}
        />
      </DashboardPageContainer>
    </>
  )
}
