import { Button } from '@/components/ui/button'
import { ChevronLeft, RotateCw } from 'lucide-react'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { MARCACOES_AGENDA_HEADER_BG } from '@/pages/area-administrativa/consultas/marcacoes/utils/marcacoes-agenda-cores'

type Props = {
  tecnicoNome?: string | null
  onRefresh?: () => void
}

/** Barra superior teal — paridade visual com Agenda Consultas. */
export function PlanningAgendaAcoesToolbar({ tecnicoNome, onRefresh }: Props) {
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()

  return (
    <div
      className='flex flex-wrap items-center justify-between gap-2 border-b border-black/15 px-3 py-2 text-white'
      style={{ backgroundColor: MARCACOES_AGENDA_HEADER_BG }}
    >
      <div className='flex min-w-0 items-center gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0 text-white hover:bg-white/15 hover:text-white'
          title='Voltar'
          onClick={closeLikeTabBar}
        >
          <ChevronLeft className='h-5 w-5' aria-hidden />
        </Button>
        <span className='truncate text-sm font-semibold tracking-wide'>
          Planning
          {tecnicoNome ? ` · ${tecnicoNome}` : ''}
        </span>
        {onRefresh ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-white hover:bg-white/15 hover:text-white'
            title='Atualizar'
            onClick={onRefresh}
          >
            <RotateCw className='h-4 w-4' />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
