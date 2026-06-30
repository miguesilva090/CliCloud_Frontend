import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'

export function ListagemCredenciaisSnsFicheiroEletronicoPage() {
  const title = 'Credenciais S.N.S. — Ficheiro Eletrónico'

  return (
    <>
      <PageHead title={`${title} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title={title}>
          <p className='text-sm text-muted-foreground'>
            Corresponde ao legado{' '}
            <span className='font-medium'>CredenciaisSnsFicheiroEletronicoLst.aspx</span>.
            A listagem e exportação de ficheiros eletrónicos SNS estão em preparação no
            novo sistema.
          </p>
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
