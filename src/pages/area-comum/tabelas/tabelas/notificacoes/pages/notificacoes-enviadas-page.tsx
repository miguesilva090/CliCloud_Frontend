import { NotificacoesPageShell } from '../components/notificacoes-page-shell'

/** Alinhado ao legado `NotificacoesEnviadasLst.aspx`. */
export function NotificacoesEnviadasPage() {
  return (
    <NotificacoesPageShell
      pageHeadTitle='Notificações enviadas | Área Comum | CliCloud'
      heading='Notificações enviadas'
      listMode={1}
    />
  )
}
