import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

/** Página da rota /area-comum/tabelas: apenas fundo (ex.: ao fechar uma listagem como Médicos). */
export function TabelasPage() {
  return (
    <>
      <PageHead title='Tabelas' />
      <DashboardPageContainer>{null}</DashboardPageContainer>
    </>
  )
}
