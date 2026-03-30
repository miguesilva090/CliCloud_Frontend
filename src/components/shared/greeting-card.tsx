import { Card, CardContent } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

interface GreetingCardProps {
  userName?: string
  showStatus?: boolean
  className?: string
}

export function GreetingCard({
  userName,
  showStatus = true,
  className = '',
}: GreetingCardProps) {
  const currentTime = new Date()
  const hour = currentTime.getHours()
  const dayOfWeek = currentTime.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Enhanced time-based greeting with more specific periods
  const getGreeting = () => {
    if (hour >= 5 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 14) return 'Bom almoço'
    if (hour >= 14 && hour < 18) return 'Boa tarde'
    if (hour >= 18 && hour < 22) return 'Boa noite'
    return 'Boa madrugada'
  }

  // Get appropriate icon based on time
  const getGreetingIcon = () => {
    if (hour >= 5 && hour < 12) return Icons.sun
    if (hour >= 12 && hour < 14) return Icons.pizza
    if (hour >= 14 && hour < 18) return Icons.sun
    if (hour >= 18 && hour < 22) return Icons.moon
    return Icons.moon
  }

  const greeting = getGreeting()

  // Get user's first name with better handling
  const getUserFirstName = () => {
    if (!userName) return 'Utilizador'
    const firstName = userName.trim().split(' ')[0]
    return firstName || 'Utilizador'
  }

  // Get contextual message based on time and day
  const getContextualMessage = () => {
    if (isWeekend) {
      return 'Esperamos que tenha um bom fim de semana!'
    }
    if (hour >= 8 && hour < 18) {
      return 'Bem-vindo ao seu dashboard'
    }
    if (hour >= 18 && hour < 22) {
      return 'Obrigado pelo seu trabalho hoje!'
    }
    return 'Bem-vindo ao seu dashboard'
  }

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-card/98 via-card/95 to-card/90 border border-border/60 shadow-2xl shadow-primary/5 hover:shadow-3xl hover:shadow-primary/10 transition-shadow duration-200 group ${className}`}
    >
      {/* Simplified background effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5'></div>
      <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl'></div>
      <div className='absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-accent/20 to-accent/5 rounded-full blur-xl'></div>

      <CardContent className='relative z-10 p-4 md:p-5'>
        <div className='flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-start gap-3 mb-2'>
              <div className='relative group/avatar'>
                <div className='w-10 h-10 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-md flex items-center justify-center shadow-md shadow-primary/20 border border-primary/20'>
                  {(() => {
                    const IconComponent = getGreetingIcon()
                    return <IconComponent className='h-5 w-5 text-primary' />
                  })()}
                </div>
                <div className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-background shadow-md'></div>
              </div>
              <div className='flex-1 space-y-1'>
                <h1 className='text-2xl xl:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight'>
                  {greeting}, {getUserFirstName()}!
                </h1>
                <p className='text-muted-foreground text-base font-medium leading-relaxed max-w-xl'>
                  {getContextualMessage()}
                </p>
                {showStatus && (
                  <div className='flex items-center gap-2 text-xs text-muted-foreground/80'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
                    <span>
                      Sistema ativo •{' '}
                      {new Date().toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
