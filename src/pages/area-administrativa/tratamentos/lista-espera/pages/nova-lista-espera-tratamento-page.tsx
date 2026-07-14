import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { modules } from '@/config/modules'
import { ListaEsperaTratamentoViewEditModal } from '../modals/lista-espera-tratamento-view-edit-modal'

const listPermId = modules.areaAdministrativa.permissions.listaEsperaTratamentos.id

export function NovaListaEsperaTratamentoPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Lista de Espera | CliCloud' />
      <DashboardPageContainer>
        <ListaEsperaTratamentoViewEditModal
          open
          renderAsPage
          onOpenChange={(nextOpen) => {
            if (!nextOpen) closeWindowTab()
          }}
          mode='create'
          row={null}
          listPermId={listPermId}
          onSuccess={closeWindowTab}
        />
      </DashboardPageContainer>
    </>
  )
}
