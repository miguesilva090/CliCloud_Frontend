import { useParams, Navigate } from 'react-router-dom'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

const SECTION_LABELS: Record<string, string> = {
  entidades: 'Entidades',
  stocks: 'Stocks',
  consultas: 'Consultas',
  tratamentos: 'Tratamentos',
  exames: 'Exames',
  configuracao: 'Configuração',
  notificacoes: 'Notificações',
}

export function TabelasSectionPage() {
  const { section } = useParams<{ section: string }>()
  const label = section ? SECTION_LABELS[section] ?? section : 'Tabelas'

  if (section === 'configuracao') {
    return (
      <Navigate
        to='/area-comum/tabelas/configuracao/clinicas'
        replace
      />
    )
  }

  if (section === 'notificacoes') {
    return <Navigate to='/area-comum/tabelas/notificacoes' replace />
  }

  if (section === 'notificacao-tipos') {
    return <Navigate to='/area-comum/tabelas/notificacao-tipos' replace />
  }

  return (
    <>
      <PageHead title={`CliCloud`} />
      <DashboardPageContainer>
        <div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
          <p className='text-muted-foreground'>{label} — em desenvolvimento.</p>
        </div>
      </DashboardPageContainer>
    </>
  )
}
