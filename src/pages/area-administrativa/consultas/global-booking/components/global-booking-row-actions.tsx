import {
  Ban,
  Download,
  ListTodo,
  SquarePlus,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PedidoConsultaTableDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'

export type GlobalBookingRowActionsHandlers = {
  onMarcar: (row: PedidoConsultaTableDTO) => void
  onDownloadFicheiro: (codigo: number) => void
  onAddUtente: (row: PedidoConsultaTableDTO) => void
  onRecusar: (row: PedidoConsultaTableDTO) => void
  onReverterRecusado: (row: PedidoConsultaTableDTO) => void
  onEmailAgendado: (codigo: number) => void
  onSmsAgendado: (codigo: number) => void
  onEmailPedido: (codigo: number) => void
  onSmsPedido: (codigo: number) => void
}

type Props = {
  row: PedidoConsultaTableDTO
  canChange: boolean
  handlers: GlobalBookingRowActionsHandlers
}

/** Paridade PedidosConsultaLst.js RowButtons (+ download, user, ban, menu tasks). */
export function GlobalBookingRowActions({ row, canChange, handlers }: Props) {
  if (!canChange) {
    return null
  }

  return (
    <div className='flex items-center justify-end gap-0.5'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-primary'
        title='Marcar Consulta'
        onClick={() => handlers.onMarcar(row)}
      >
        <SquarePlus className='h-4 w-4' />
      </Button>

      {row.temFicheiro ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-primary'
          title='Download Ficheiro'
          onClick={() => handlers.onDownloadFicheiro(row.codigo)}
        >
          <Download className='h-4 w-4' />
        </Button>
      ) : null}

      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-primary'
        title='Adicionar Utente'
        onClick={() => handlers.onAddUtente(row)}
      >
        <User className='h-4 w-4' />
      </Button>

      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-primary'
        title='Recusar'
        onClick={() => handlers.onRecusar(row)}
      >
        <Ban className='h-4 w-4' />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-primary'
            title='Mais opções'
          >
            <ListTodo className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-[240px]'>
          <DropdownMenuItem onClick={() => handlers.onEmailAgendado(row.codigo)}>
            Enviar Email Agendamento Efetuado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onSmsAgendado(row.codigo)}>
            Enviar Sms Agendamento Efetuado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onEmailPedido(row.codigo)}>
            Enviar Email Pedido Recebido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onSmsPedido(row.codigo)}>
            Enviar Sms Pedido Recebido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onReverterRecusado(row)}>
            Reverter Recusado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
