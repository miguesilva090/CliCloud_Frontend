import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ListagemNotificacoesSection } from '../components/listagem-notificacoes-section'

/** Alinhado ao legado `NotificacoesAtualizacoesLst.aspx`. Mesmo layout que as restantes listagens (seta retroceder + toolbar em linha). */
export function NotificacoesAtualizacoesPage() {
  return (
    <>
      <PageHead title='Notificações de atualização | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Notificações de atualização'>
          <ListagemNotificacoesSection listMode={2} />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
