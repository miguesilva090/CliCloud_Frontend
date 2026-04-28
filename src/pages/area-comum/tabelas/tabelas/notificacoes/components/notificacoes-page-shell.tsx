import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ListagemNotificacoesSection } from './listagem-notificacoes-section'

export function NotificacoesPageShell({
  pageHeadTitle,
  heading,
  listMode,
}: {
  pageHeadTitle: string
  heading: string
  listMode: number
}) {
  return (
    <>
      <PageHead title={pageHeadTitle} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={heading}>
          <ListagemNotificacoesSection listMode={listMode} />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
