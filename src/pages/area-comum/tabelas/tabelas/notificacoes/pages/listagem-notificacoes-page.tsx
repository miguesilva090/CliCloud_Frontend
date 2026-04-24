import { NotificacoesPageShell } from '../components/notificacoes-page-shell'

/** Caixa de entrada — alinhado ao legado `NotificacoesLst.aspx` (CliCloud.ASPcli\Client\Comum). */
export function ListagemNotificacoesPage() {
  return (
    <NotificacoesPageShell
      pageHeadTitle='Notificações | Tabelas | Área Comum | CliCloud'
      heading='Notificações'
      listMode={0}
    />
  )
}
