import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { useConsultarUtenteRnu } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utente-rnu-mutations'
import { useWindowsStore } from '@/stores/use-windows-store'
import { ResponseStatus } from '@/types/api/responses'
import { openUtenteCreationInApp } from '@/utils/window-utils'
import { toast } from '@/utils/toast-utils'
import {
  buildRnuPrefillPayload,
  RNU_PREFILL_STORAGE_KEY,
  type RnuPrefillPayload,
} from '../utils/rnu-receita'

type Props = {
  /** N.º SNS actual do utente seleccionado (pré-preenche o input). */
  numeroSnsActual?: string | null
  onUtenteSeleccionado: (utenteId: string, label?: string) => void
  disabled?: boolean
}

/**
 * Paridade legado PrescricaoRSPEdtNova: input SNS + botão RNU.
 * CC (Cartão Cidadão) fica fora deste pack (P1.6b).
 */
export function ReceitaRnuControls({
  numeroSnsActual,
  onUtenteSeleccionado,
  disabled,
}: Props) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const consultarRnu = useConsultarUtenteRnu()

  const [snsDraft, setSnsDraft] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [prefill, setPrefill] = useState<RnuPrefillPayload | null>(null)

  useEffect(() => {
    setSnsDraft((numeroSnsActual ?? '').trim())
  }, [numeroSnsActual])

  const handleRnu = async () => {
    const numeroSns = snsDraft.trim()
    if (!numeroSns) {
      toast.error('Introduza o Número de Utente (SNS).', 'RNU')
      return
    }

    try {
      const info = await consultarRnu.mutateAsync({
        numeroSns,
        numeroCartao: null,
        tipoCartao: null,
      })

      if (info.status !== ResponseStatus.Success || !info.data) {
        const msg =
          info.messages?.['$']?.[0] ||
          Object.values(info.messages || {})?.[0]?.[0] ||
          'Falha ao consultar RNU'
        toast.error(msg, 'RNU')
        return
      }

      const nome =
        info.data.nomeCompleto || info.data.nomesProprios || 'Utente'
      const numeroSnsEncontrado = (info.data.numeroSns ?? '').trim()

      if (numeroSnsEncontrado) {
        const existente =
          await UtentesService('utentes').getUtenteByNumeroUtente(
            numeroSnsEncontrado
          )
        if (
          existente.info?.status === ResponseStatus.Success &&
          existente.info?.data?.id
        ) {
          onUtenteSeleccionado(existente.info.data.id, nome)
          toast.success(`${nome} seleccionado na receita.`, 'RNU')
          return
        }
      }

      setPrefill(buildRnuPrefillPayload(info.data))
      setConfirmOpen(true)
    } catch {
      // onError da mutation já mostra toast
    }
  }

  const handleConfirmarCriar = () => {
    if (prefill) {
      sessionStorage.setItem(
        RNU_PREFILL_STORAGE_KEY,
        JSON.stringify(prefill)
      )
    }
    setConfirmOpen(false)
    openUtenteCreationInApp(navigate, addWindow)
  }

  return (
    <>
      <div className='space-y-1'>
        <Label>
          N.º utente (SNS) <span className='text-destructive'>*</span>
        </Label>
        <div className='flex gap-2'>
          <Input
            className='h-8'
            value={snsDraft}
            disabled={disabled}
            inputMode='numeric'
            maxLength={9}
            placeholder='N.º SNS'
            onChange={(e) =>
              setSnsDraft(e.target.value.replace(/\D/g, '').slice(0, 9))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleRnu()
              }
            }}
          />
          <Button
            type='button'
            variant='secondary'
            className='h-8 shrink-0'
            disabled={disabled || consultarRnu.isPending}
            onClick={() => void handleRnu()}
          >
            {consultarRnu.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'RNU'
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>
              O utente não existe no formulário dos utentes.
              <br />
              Deseja inserir com a informação do RNU?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarCriar}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
