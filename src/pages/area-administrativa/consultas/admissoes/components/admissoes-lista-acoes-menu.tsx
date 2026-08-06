import { useState } from 'react'
import {
  Archive,
  ClipboardList,
  FileText,
  ListTodo,
  MessageSquare,
  Printer,
  Stethoscope,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import {
  acaoEnviarSms,
  acaoKiosk,
  relatorioDeclaracaoPresenca,
  relatorioEtiquetaAdmissao,
  relatorioEtiquetaUtente,
  relatorioLevantamentoExames,
  relatorioProcessoOrganismo,
} from '../utils/admissao-relatorios'

export type AdmissoesListaAcoesCallbacks = {
  onOpenObservacoes: (row: AdmissaoTableDTO) => void
  onPromoted?: () => void
}

type Props = AdmissoesListaAcoesCallbacks & {
  row: AdmissaoTableDTO
  listPermId: string
  runAction: (fn: () => Promise<unknown>, success: string) => Promise<void>
  canChange?: boolean
}

export function AdmissoesListaAcoesMenu({
  row,
  listPermId,
  runAction,
  onOpenObservacoes,
  onPromoted,
  canChange = true,
}: Props) {
  const [promoverOpen, setPromoverOpen] = useState(false)
  const [promovendo, setPromovendo] = useState(false)

  const confirmarPromover = async () => {
    setPromovendo(true)
    try {
      const res = await AdmissaoAdministrativoService(listPermId).promoverParaConsulta(row.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Admissão passada para histórico.')
        if (res.info.data?.sugerirMarcacoesFisio) {
          toast.info(
            'Admissão de fisioterapia: no legado abre-se o fluxo de marcações de tratamentos (módulo em desenvolvimento).'
          )
        }
        setPromoverOpen(false)
        onPromoted?.()
      } else {
        toast.error(res.info?.messages?.$?.[0] ?? 'Não foi possível passar para histórico.')
      }
    } catch {
      toast.error('Não foi possível passar para histórico.')
    } finally {
      setPromovendo(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='h-8 w-8' title='Opções'>
            <ListTodo className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuItem onClick={() => onOpenObservacoes(row)}>
            <ClipboardList className='mr-2 h-4 w-4' />
            Observações
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => relatorioDeclaracaoPresenca(row.utenteId, row.id)}
          >
            <FileText className='mr-2 h-4 w-4' />
            Declaração de presença
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => relatorioLevantamentoExames(row.id)}>
            <Printer className='mr-2 h-4 w-4' />
            Levantamento de exames
          </DropdownMenuItem>
          {canChange ? (
            <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPromoverOpen(true)}>
            <Archive className='mr-2 h-4 w-4' />
            Passar para histórico
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => acaoEnviarSms(row.utenteId)}>
            <MessageSquare className='mr-2 h-4 w-4' />
            Enviar SMS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => relatorioProcessoOrganismo(row.id)}>
            <Stethoscope className='mr-2 h-4 w-4' />
            Processo organismo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => relatorioEtiquetaUtente(row.utenteId)}>
            <Tag className='mr-2 h-4 w-4' />
            Etiqueta 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => relatorioEtiquetaAdmissao(row.utenteId, row.id)}
          >
            <Tag className='mr-2 h-4 w-4' />
            Etiqueta admissão
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              void runAction(
                () =>
                  AdmissaoAdministrativoService(listPermId).confirmar(
                    row.id,
                    !row.confirmado
                  ),
                row.confirmado ? 'Presente desmarcado.' : 'Presente confirmado.'
              )
            }
          >
            {row.confirmado ? 'Desmarcar presente' : 'Confirmar presente'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void runAction(
                () =>
                  AdmissaoAdministrativoService(listPermId).setEfetuado(
                    row.id,
                    !row.efetuado
                  ),
                'Estado de efetuado atualizado.'
              )
            }
          >
            {row.efetuado ? 'Marcar não efetuado' : 'Marcar efetuado'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => acaoKiosk(row.utenteId, false)}>
            Desbloquear acesso kiosk
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => acaoKiosk(row.utenteId, true)}>
            Bloquear acesso kiosk
          </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={promoverOpen} onOpenChange={setPromoverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Passar para histórico</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja passar esta admissão para histórico?
              <br />
              Será criada a consulta correspondente e a admissão deixará de aparecer como pendente.
              <span className='mt-2 block text-sm'>
                <strong>Utente:</strong> {row.utenteNome ?? '—'}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={promovendo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={promovendo}
              onClick={(e) => {
                e.preventDefault()
                void confirmarPromover()
              }}
            >
              {promovendo ? 'A processar…' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
