import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, ChevronDown, ChevronLeft, RotateCw, Send } from 'lucide-react'
import { toast } from '@/utils/toast-utils'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import {
  MARCACOES_AGENDA_ACTION_BLUE,
  MARCACOES_AGENDA_ACTION_BTN,
  MARCACOES_AGENDA_HEADER_BG,
  MARCACOES_AGENDA_HEADER_BTN,
} from '../utils/marcacoes-agenda-cores'

type Props = {
  canChange: boolean
  canDelete: boolean
  modoDisponibilidade: boolean
  selectedMarcacaoId: string | null
  onDisponibilidade: () => void
  onSairDisponibilidade: () => void
  onEnvioSms: () => void
  onAssociarSala: () => void
  onListagens: () => void
  onDesmarcar: () => void
  onRefresh: () => void
}

export function MarcacoesAgendaAcoesToolbar({
  canChange,
  canDelete,
  modoDisponibilidade,
  selectedMarcacaoId,
  onDisponibilidade,
  onSairDisponibilidade,
  onEnvioSms,
  onAssociarSala,
  onListagens,
  onDesmarcar,
  onRefresh,
}: Props) {
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
          {modoDisponibilidade ? 'Disponibilidade' : 'Agenda'}
        </span>
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
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {modoDisponibilidade ? (
          <Button
            type='button'
            size='sm'
            variant='outline'
            className={MARCACOES_AGENDA_HEADER_BTN}
            onClick={onSairDisponibilidade}
          >
            Voltar à agenda
          </Button>
        ) : (
          <>
            <Button
              type='button'
              size='sm'
              className={MARCACOES_AGENDA_ACTION_BTN}
              style={{ backgroundColor: MARCACOES_AGENDA_ACTION_BLUE }}
              onClick={onDisponibilidade}
            >
              Disponibilidade
            </Button>

            {canChange ? (
              <>
                <Button
                  type='button'
                  size='sm'
                  className={MARCACOES_AGENDA_ACTION_BTN}
                  style={{ backgroundColor: MARCACOES_AGENDA_ACTION_BLUE }}
                  onClick={onEnvioSms}
                >
                  <Send className='mr-1 h-3.5 w-3.5' />
                  Envio SMS
                </Button>

                <Button
                  type='button'
                  size='sm'
                  className={MARCACOES_AGENDA_ACTION_BTN}
                  style={{ backgroundColor: MARCACOES_AGENDA_ACTION_BLUE }}
                  onClick={() => {
                    if (!selectedMarcacaoId) {
                      toast.error('Selecione uma marcação no calendário (clique no evento).')
                      return
                    }
                    onAssociarSala()
                  }}
                >
                  <Building2 className='mr-1 h-3.5 w-3.5' />
                  Sala
                </Button>
              </>
            ) : null}

            {canDelete ? (
              <Button
                type='button'
                size='sm'
                variant='destructive'
                className='h-8 shadow-sm'
                onClick={() => {
                  if (!selectedMarcacaoId) {
                    toast.error('Selecione uma marcação no calendário (clique no evento).')
                    return
                  }
                  onDesmarcar()
                }}
              >
                Desmarcar
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className={MARCACOES_AGENDA_HEADER_BTN}
                >
                  Listagens
                  <ChevronDown className='ml-1 h-3.5 w-3.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={onListagens}>
                  Exportar marcações (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}
