import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ListagemNotificacoesSection } from '../components/listagem-notificacoes-section'

/** Alinhado ao legado `NotificacoesEnviadasLst.aspx`. Mesmo layout que as restantes listagens (seta retroceder + toolbar em linha). */
export function NotificacoesEnviadasPage() {
  return (
    <>
      <PageHead title='Notificações enviadas | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Notificações enviadas'>
          <ListagemNotificacoesSection listMode={1} />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
