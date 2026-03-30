import { useParams } from 'react-router-dom'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

const ENTIDADES_SUB_LABELS: Record<string, string> = {
  utentes: 'Utentes',
  medicos: 'Médicos',
  'medicos-externos': 'Médicos Externos',
  organismos: 'Organismos',
  'centros-saude': 'Centros de Saúde',
  funcionarios: 'Funcionarios',
  fornecedores: 'Fornecedores',
  empresas: 'Empresas',
  tecnicos: 'Técnicos',
}

export function TabelasEntidadesSubPage() {
  const { subSection } = useParams<{ subSection: string }>()
  const label = subSection
    ? ENTIDADES_SUB_LABELS[subSection] ?? subSection
    : 'Entidades'

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
