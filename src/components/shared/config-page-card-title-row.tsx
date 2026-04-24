import type { ReactNode } from 'react'
import { CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ConfigPageCardTitleRowProps = {
  title: ReactNode
  canChange: boolean
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  /** Botões de navegação ou utilitários (ex.: Histórico) — ficam à esquerda do Editar/Cancelar. */
  trailing?: ReactNode
}

export function ConfigPageCardTitleRow({
  title,
  canChange,
  isEditing,
  onStartEdit,
  onCancelEdit,
  trailing,
}: ConfigPageCardTitleRowProps) {
  return (
    <div className='flex flex-row items-center justify-between gap-3'>
      <CardTitle className='text-lg font-semibold leading-tight tracking-tight'>
        {title}
      </CardTitle>
      <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
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
      </div>
    </div>
  )
}
