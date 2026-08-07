import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { modules } from '@/config/modules'
import {
  getDataTrabalhoDate,
  getDataTrabalhoIsoDate,
} from '@/lib/utils/data-trabalho'
import { FechoDiarioTratamentoAdministrativoService } from '@/lib/services/tratamentos/fecho-diario-tratamento-administrativo-service/fecho-diario-tratamento-administrativo-client'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

const permId = modules.areaAdministrativa.permissions.admissoes.id

function resolveDataTrabalho(): { iso: string; label: string } {
  const d = getDataTrabalhoDate()
  return {
    iso: getDataTrabalhoIsoDate(),
    label: format(d, 'dd-MM-yyyy'),
  }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FechoDiarioTratamentoModal({ open, onOpenChange }: Props) {
  const { iso, label } = useMemo(() => resolveDataTrabalho(), [open])
  const [loading, setLoading] = useState(false)

  const fechar = () => {
    if (!loading) onOpenChange(false)
  }

  const confirmar = async () => {
    setLoading(true)
    try {
      const res = await FechoDiarioTratamentoAdministrativoService(
        permId
      ).executarFecho({ data: iso })
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        const d = res.info.data
        const partes = [
          d.totalSessoesHistorico > 0
            ? `${d.totalSessoesHistorico} sessão(ões) em histórico`
            : null,
          d.totalTratamentosFechados > 0
            ? `${d.totalTratamentosFechados} tratamento(s) concluído(s)`
            : null,
        ].filter(Boolean)
        toast.success(
          partes.length
            ? `Fecho diário efetuado (${partes.join(', ')}).`
            : 'Fecho diário efetuado.'
        )
        onOpenChange(false)
        return
      }
      const msg =
        Object.values(res.info?.messages ?? {})
          .flat()
          .find(Boolean) ?? 'Falha no fecho diário.'
      toast.error(msg)
    } catch {
      toast.error('Falha no fecho diário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent
        className='max-w-md gap-0 p-0 sm:rounded-md'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault()
        }}
      >
        <DialogHeader className='border-b px-4 py-3 text-left'>
          <DialogTitle className='text-base font-semibold'>
            Fecho Diário
          </DialogTitle>
        </DialogHeader>

        <p className='px-4 py-6 text-center text-sm text-foreground'>
          Confirma passagem do dia {label} para histórico?
        </p>

        <DialogFooter className='gap-2 border-t px-4 py-3 sm:justify-end'>
          <Button
            type='button'
            variant='secondary'
            onClick={fechar}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => void confirmar()}
            disabled={loading}
          >
            {loading ? 'A processar...' : 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}