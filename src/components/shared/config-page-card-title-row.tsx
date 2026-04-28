import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

type ConfigPageCardActionsProps = {
  canChange: boolean
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  trailing?: ReactNode
}

/** Só os botões Editar/Cancelar (+ trailing). Para usar dentro de AreaComumDashboardCard. */
export function ConfigPageCardActions({
  canChange,
  isEditing,
  onStartEdit,
  onCancelEdit,
  trailing,
}: ConfigPageCardActionsProps) {
  return (
    <>
      {trailing}
      {canChange && !isEditing ? (
        <Button type='button' variant='outline' onClick={onStartEdit}>
          Editar
        </Button>
      ) : null}
      {canChange && isEditing ? (
        <Button type='button' variant='outline' onClick={onCancelEdit}>
          Cancelar
        </Button>
      ) : null}
    </>
  )
}

type ConfigPageCardTitleRowProps = {
  title: ReactNode
  canChange: boolean
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  /** Botões de navegação ou utilitários (ex.: Histórico) — ficam à esquerda do Editar/Cancelar. */
  trailing?: ReactNode
  /** Por defeito igual às listagens Área Comum: fechar a janela/tab actual. */
  showBackButton?: boolean
  onBack?: () => void
}

export function ConfigPageCardTitleRow({
  title,
  canChange,
  isEditing,
  onStartEdit,
  onCancelEdit,
  trailing,
  showBackButton = true,
  onBack,
}: ConfigPageCardTitleRowProps) {
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const handleBack = onBack ?? closeLikeTabBar

  return (
    <div className='flex flex-row flex-wrap items-center justify-between gap-3'>
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
        <CardTitle className='truncate text-lg font-semibold leading-tight tracking-tight'>
          {title}
        </CardTitle>
      </div>
      <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
        <ConfigPageCardActions
          canChange={canChange}
          isEditing={isEditing}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          trailing={trailing}
        />
      </div>
    </div>
  )
}
