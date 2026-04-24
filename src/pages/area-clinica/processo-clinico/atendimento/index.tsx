import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { Icons } from '@/components/ui/icons'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'

const CARDS = [
  {
    title: 'Consultas do Dia',
    description: 'Lista e gestão das consultas agendadas para hoje',
    icon: Icons.clock,
    path: '/area-clinica/processo-clinico/atendimento/consultas-do-dia',
  },
  {
    title: 'Ficha Clinica',
    description: 'Registo e consulta da ficha clínica do utente',
    icon: Icons.fileText,
    path: '/area-clinica/processo-clinico/atendimento/ficha-clinica',
  },
]

export function AtendimentoUtentePage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHead title='Atendimento ao Utente | CliCloud' />
      <DashboardPageContainer>
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-3'>
            <div className='p-3 rounded-md bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm'>
              <Icons.user className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
                Atendimento ao Utente
              </h1>
              <p className='text-muted-foreground/80 text-sm mt-1'>
                Consultas do dia e ficha clínica
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {CARDS.map((card) => (
            <div
              key={card.path}
              className='group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 transition-all duration-200 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/60 hover:scale-[1.02] hover:bg-card/80 cursor-pointer'
              onClick={() => navigateManagedWindow(navigate, card.path)}
            >
              <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
              <div className='relative p-6'>
                <div className='flex items-start gap-4'>
                  <div className='relative p-4 rounded-md bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm group-hover:shadow-md group-hover:shadow-primary/25 group-hover:scale-105 transition-all duration-200'>
                    <card.icon className='h-6 w-6 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-foreground group-hover:text-primary transition-colors mb-1'>
                      {card.title}
                    </h3>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {card.description}
                    </p>
                  </div>
                  <div className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Icons.arrowRight className='h-5 w-5 text-primary' />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardPageContainer>
    </>
  )
}
