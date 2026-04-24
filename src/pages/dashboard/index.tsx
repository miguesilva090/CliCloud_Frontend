import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { useAuthStore } from '@/stores/auth-store'
import { Icons } from '@/components/ui/icons'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { GreetingCard } from '@/components/shared/greeting-card'
import { PageHead } from '@/components/shared/page-head'
import { RecentPagesGrid } from '@/components/shared/recent-pages-grid'

export function DashboardPage() {
  const { name } = useAuthStore()
  const navigate = useNavigate()

  // Define module configurations with icons, colors, and descriptions
  const moduleConfigs = [
    {
      id: 'saude',
      name: 'Saúde',
      description: 'Utentes, consultas, médicos e tratamentos',
      icon: Icons.user,
      color: 'bg-blue-500',
      path: '/utentes',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient:
        'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
      underDevelopment: false,
    },
  ]

  const availableModules = moduleConfigs

  return (
    <>
      <PageHead title='Dashboard | CliCloud' />
      <DashboardPageContainer>
        {/* Welcome Section */}
        <div className='mb-8'>
          <GreetingCard
            userName={name}
            showStatus={false}
          />
        </div>

        {/* Recent Pages Grid */}
        <div className='mb-8'>
          <RecentPagesGrid maxPages={5} title='Recentes' />
        </div>

        {/* Modules Grid */}
        <div className='w-full relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-2xl shadow-primary/5 p-6 mb-8'>
          <div className='mb-6'>
            <div className='flex items-center gap-4 mb-3'>
              <div className='p-3 rounded-md bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm'>
                <Icons.dashboard className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
                  Módulos Disponíveis
                </h2>
                <p className='text-muted-foreground/80 text-sm mt-1'>
                  Selecione um módulo para aceder às suas funcionalidades
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {availableModules.map((module) => {
              const isUnderDevelopment = module.underDevelopment
              return (
                <div
                  key={module.id}
                  className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 transition-all duration-200 ${
                    isUnderDevelopment
                      ? 'cursor-not-allowed opacity-75'
                      : 'hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/60 hover:scale-[1.02] hover:bg-card/80 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isUnderDevelopment) {
                      navigateManagedWindow(navigate, module.path)
                    }
                  }}
                >
                  {/* Modern glassmorphism background */}
                  {!isUnderDevelopment && (
                    <>
                      <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />

                      {/* Floating particles effect */}
                      <div className='absolute top-2 right-2 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-50'></div>
                      <div className='absolute bottom-3 left-3 w-1.5 h-1.5 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100'></div>
                    </>
                  )}

                  <div className='relative p-6'>
                    <div className='flex items-start gap-4'>
                      {/* Modern icon container with glow */}
                      <div
                        className={`relative p-4 rounded-md bg-gradient-to-r ${module.gradient} shadow-lg ${
                          !isUnderDevelopment
                            ? 'group-hover:shadow-2xl group-hover:shadow-primary/25 group-hover:scale-105'
                            : ''
                        } transition-all duration-200`}
                      >
                        {!isUnderDevelopment && (
                          <div className='absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
                        )}
                        <module.icon className='h-8 w-8 text-white relative z-10' />
                        {module.underDevelopment && (
                          <div className='absolute -top-0.5 -right-0.5 w-6 h-3 bg-violet-500 text-white text-[6px] font-bold flex items-center justify-center -rotate-[8deg] shadow-sm border border-violet-600/30'>
                            des
                          </div>
                        )}
                      </div>

                      {/* Content with modern typography */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3
                            className={`font-bold text-lg text-foreground ${
                              !isUnderDevelopment
                                ? 'group-hover:text-primary'
                                : ''
                            } transition-colors duration-200`}
                          >
                            {module.name}
                          </h3>
                        </div>
                        <p
                          className={`text-sm text-muted-foreground ${
                            !isUnderDevelopment
                              ? 'group-hover:text-muted-foreground/90'
                              : ''
                          } transition-colors duration-200 line-clamp-2 leading-relaxed mb-4`}
                        >
                          {module.description}
                        </p>
                        {!isUnderDevelopment && (
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Icons.arrowRight className='h-4 w-4' />
                            <span>Clique para aceder</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modern gradient border */}
                  {!isUnderDevelopment && (
                    <>
                      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>

                      {/* Subtle shine effect */}
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-300 opacity-0 group-hover:opacity-100'></div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </DashboardPageContainer>
    </>
  )
}
