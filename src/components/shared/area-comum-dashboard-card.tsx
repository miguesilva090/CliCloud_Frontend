import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

export type AreaComumDashboardCardProps = {
  title?: ReactNode
  /** Ações à direita do cabeçalho (ex.: Atualizar). O botão X de fechar foi substituído pela seta ao lado do título. */
  headerTrailing?: ReactNode
  children: ReactNode
  /** Por defeito chama o mesmo fluxo que fechar a tab na barra inferior. */
  onBack?: () => void
  showBackButton?: boolean
  /** Sem CardHeader — o título vai na mesma linha da toolbar (via contexto na DataTable). */
  omitHeader?: boolean
  cardClassName?: string
  headerClassName?: string
  contentClassName?: string
}

/**
 * Card único para conteúdo da Área Comum (listagens e configurações), alinhado ao estilo
 * «Configuração Exames Sem Papel»: fundo branco, borda, título com seta para fechar a janela/tab.
 */
export function AreaComumDashboardCard({
  title,
  headerTrailing,
  children,
  onBack,
  showBackButton = true,
  omitHeader = false,
  cardClassName,
  headerClassName,
  contentClassName,
}: AreaComumDashboardCardProps) {
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const handleBack = onBack ?? closeLikeTabBar

  if (omitHeader) {
    return (
      <Card className={cn('shadow-md rounded-xl', cardClassName)}>
        <CardContent className={cn(contentClassName)}>{children}</CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('shadow-md rounded-xl', cardClassName)}>
      <CardHeader
        className={cn(
          'flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-5 py-3 sm:px-6',
          headerClassName,
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          {showBackButton ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={handleBack}
              title='Voltar'
            >
              <ChevronLeft className='h-5 w-5' aria-hidden />
            </Button>
          ) : null}
          <CardTitle className='truncate text-base font-semibold leading-snug tracking-tight sm:text-lg'>
            {title}
          </CardTitle>
        </div>
        {headerTrailing ? (
          <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
            {headerTrailing}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  )
}
