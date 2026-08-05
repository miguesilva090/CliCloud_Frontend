import { Link } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

export function PesquisaVagaPage() {
  return (
    <>
      <PageHead title='Pesquisa de Vaga | Tratamentos' />
      <DashboardPageContainer>
        <div className='p-4 space-y-2'>
          <h1 className='text-lg font-semibold'>Pesquisa de Vaga</h1>
          <p className='text-sm text-muted-foreground'>
            Em construção (T3.7). Usa o motor de disponibilidade já existente em
            marcações manuais / compensar falta.
          </p>
          <Link
            className='text-sm text-primary underline'
            to='/area-administrativa/tratamentos/planning'
          >
            Ir para Planning Geral
          </Link>
        </div>
      </DashboardPageContainer>
    </>
  )
}
