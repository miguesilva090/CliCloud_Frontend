import { useState, useEffect } from 'react'
import { UserAuthForm } from '@/pages/auth/signin/components/user-auth-form'
import { Link } from 'react-router-dom'
import { Logo as LogoLetters } from '@/assets/logo-letters'
import { loadAppVersion } from '@/lib/app-version'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { AppPreparation } from '@/components/shared/app-preparation'
import { ModeToggle } from '@/components/shared/theme-toggle'

export default function () {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    loadAppVersion()
      .then(setAppVersion)
      .catch(() => {
        setAppVersion('')
      })
  }, [])


  return (
    <>
      <AppPreparation />
      <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <div className='absolute right-4 top-4 md:right-8 md:top-8 z-10'>
          <ModeToggle />
        </div>
        <Link
          to='/'
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 hidden md:right-8 md:top-8'
          )}
        >
          Login
        </Link>
        <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex overflow-hidden'>
          {/* Gradient de fundo — base estática */}
          <div className='absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none' aria-hidden />

          {/* Gradiente animado — mais visível e dinâmico */}
          <div
            className='absolute inset-0 pointer-events-none'
            aria-hidden
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 25% 15%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 40%, transparent 70%), radial-gradient(ellipse 80% 60% at 75% 85%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 70%)',
              animation: 'gradient-shift 12s ease-in-out infinite',
            }}
          />
          <div
            className='absolute inset-0 pointer-events-none'
            aria-hidden
            style={{
              background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.12) 20%, transparent 40%, rgba(255,255,255,0.15) 60%, transparent 80%, rgba(255,255,255,0.08) 100%)',
              backgroundSize: '250% 250%',
              backgroundPosition: '0% 0%',
              animation: 'gradient-move 18s ease-in-out infinite',
            }}
          />

          {/* Vídeo DNA — loop contínuo (mesma zona das ECGs) */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden>
            <video
              src='/assets/media/vecteezy_dna-sequence-science-background_2021127.webm'
              poster='/assets/media/background-clinical.jpg'
              className='absolute inset-0 h-full w-full object-cover opacity-50'
              muted
              playsInline
              autoPlay
              loop
            />
          </div>

          {/* Elementos geométricos — círculos com gradiente (aparecer/desaparecer) e anel central */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden>
            {/* Círculo topo-esquerdo — gradiente radial, movimento amplo */}
            <div
              className='absolute -top-20 -right-20 w-72 h-72 rounded-full blur-2xl animate-[shape-float_8s_ease-in-out_infinite]'
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.12) 45%, transparent 70%)' }}
            />
            {/* Círculo meio-esquerda */}
            <div
              className='absolute top-1/3 -left-16 w-56 h-56 rounded-full blur-xl animate-[shape-float_10s_ease-in-out_infinite]'
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 50%, transparent 75%)', animationDelay: '2s' }}
            />
            {/* Círculo baixo-direita */}
            <div
              className='absolute bottom-1/4 right-1/4 w-52 h-52 rounded-full blur-lg animate-[shape-float_9s_ease-in-out_infinite]'
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.1) 48%, transparent 72%)', animationDelay: '1s' }}
            />
            {/* Anel central — mais acima */}
            <div className='absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2'>
              <div className='w-[28rem] h-[28rem] rounded-full border-2 border-white/25 animate-[ring-pulse_6s_ease-in-out_infinite]' />
            </div>
            {/* Círculo baixo-esquerdo com borda — movimento lento, gradiente de opacidade */}
            <div
              className='absolute bottom-[18%] left-[12%] w-40 h-40 rounded-full border-2 border-white/20 animate-[shape-float-slow_7s_ease-in-out_infinite]'
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 65%)' }}
            />
            {/* Círculo canto superior direito — novo */}
            <div
              className='absolute top-[8%] right-[8%] w-44 h-44 rounded-full blur-xl animate-[shape-float_7s_ease-in-out_infinite]'
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 50%, transparent 75%)', animationDelay: '2.5s' }}
            />
          </div>

          {/* Main content — bloco com hierarquia clara e aspecto profissional */}
          <div className='relative z-20 flex flex-col h-full'>
            {/* Zona de destaque: logo (em cima) → Bem-vindo → frase (logo anima por último) */}
            <div className='flex-1 flex flex-col items-center justify-center px-6 pt-2 pb-8'>
              <div className='flex flex-col items-center text-center max-w-2xl -mt-8'>
                {/* Logo — em cima; animação faz surgir por último com escala */}
                <div className='animate-logo-surge'>
                  <img
                    src='/CliCloudLogo.png'
                    alt='CliCloud'
                    className='h-40 md:h-52 w-auto max-w-[520px] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
                  />
                </div>
                <div className='my-8' aria-hidden />
                {/* Bem-vindo — surge gradualmente (não aparece de uma vez) */}
                <h2 className='text-6xl md:text-7xl font-bold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.2)] animate-bem-vindo'>
                  Bem-vindo
                </h2>
                <div className='mt-4 w-24 h-1 bg-white/80 rounded-full animate-bem-vindo-line' aria-hidden />
                {/* Frase de valor — surge depois do Bem-vindo */}
                <p className='mt-28 md:mt-32 text-center font-semibold text-lg md:text-xl max-w-xl leading-relaxed tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] animate-bem-vindo-frase'>
                  Organização, controlo e eficiência numa única plataforma.
                </p>
              </div>
            </div>

            {/* Rodapé — clean e profissional */}
            <div className='relative z-20 mt-auto pt-6 pb-8'>
              <div className='mb-6 flex justify-center'>
                <LogoLetters
                  width={200}
                  className='text-white/95 drop-shadow-md'
                  disableLink
                />
              </div>
              <div className='flex justify-center gap-12 text-xs font-medium uppercase tracking-widest text-white/60'>
                <span>Gestão Completa</span>
                <span className='text-white/30'>•</span>
                <span>Interface Moderna</span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex h-full items-center p-4 lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {showForgotPassword
                  ? 'Recuperar palavra-passe'
                  : 'Faça login para continuar'}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {showForgotPassword
                  ? 'Introduza o seu email para recuperar a palavra-passe'
                  : 'Introduza o seu email e palavra-passe para continuar'}
              </p>
            </div>

            <UserAuthForm />
            <button
              onClick={() => setShowForgotPassword(true)}
              className='text-sm text-muted-foreground hover:text-primary underline underline-offset-4'
            >
              Esqueceu a sua palavra-passe?
            </button>

            <p className='px-8 text-center text-sm text-muted-foreground'>
              Ao continuar, concorda com os nossos{' '}
              <Link
                to='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link
                to='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Política de Privacidade
              </Link>
              .
            </p>
            {appVersion && (
              <p className='px-8 text-center text-xs text-muted-foreground/70'>
                Versão {appVersion}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
