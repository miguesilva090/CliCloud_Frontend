import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

export function MapaConsultasEfetuadasPage() {
  return (
    <>
      <PageHead title='Mapa Consultas Efetuadas | Histórico | Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <div className='rounded-2xl border border-border/50 bg-card/60 p-6'>
          <h1 className='text-xl font-bold text-foreground'>
            Mapa de Consultas Efetuadas
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Em desenvolvimento. Brevemente poderá gerar o mapa de consultas
            efetuadas a partir desta página.
          </p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
