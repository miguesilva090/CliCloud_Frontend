import { useQueryClient } from '@tanstack/react-query'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AdmissaoViewEditModal } from '../modals/admissao-view-edit-modal'
import { invalidateAdmissoesListQueries } from '../queries/listagem-admissoes-queries'

export function NovaAdmissaoPage() {
  const queryClient = useQueryClient()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  const handleSaved = () => {
    invalidateAdmissoesListQueries(queryClient)
    closeWindowTab()
  }

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
          onSaved={handleSaved}
        />
      </DashboardPageContainer>
    </>
  )
}
