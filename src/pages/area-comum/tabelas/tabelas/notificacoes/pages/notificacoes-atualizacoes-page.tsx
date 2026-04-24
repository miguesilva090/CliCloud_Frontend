import { NotificacoesPageShell } from '../components/notificacoes-page-shell'

/** Alinhado ao legado `NotificacoesAtualizacoesLst.aspx`. */
export function NotificacoesAtualizacoesPage() {
  return (
    <NotificacoesPageShell
      pageHeadTitle='Notificações de atualização | Área Comum | CliCloud'
      heading='Notificações de atualização'
      listMode={2}
    />
  )
}
