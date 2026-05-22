import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { MarcacaoAdministrativoFormState } from './marcacao-administrativo-form-utils'
import {
  mapListaEsperaFormToCreatePayload,
  type ListaEsperaFormState,
} from '../../lista-espera/modals/lista-espera-form-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  marcacaoForm: MarcacaoAdministrativoFormState
  listPermId: string
  onCreated?: () => void
}

export function MarcacaoAdicionarListaEsperaModal({
  open,
  onOpenChange,
  marcacaoForm,
  listPermId,
  onCreated,
}: Props) {
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!marcacaoForm.utenteId || !marcacaoForm.especialidadeId || !marcacaoForm.data) {
      toast.error('Preencha utente, especialidade e data na marcação.')
      return
    }

    const leForm: ListaEsperaFormState = {
      utenteId: marcacaoForm.utenteId,
      utenteLabel: marcacaoForm.utenteLabel,
      medicoId: marcacaoForm.medicoId,
      medicoLabel: marcacaoForm.medicoLabel,
      especialidadeId: marcacaoForm.especialidadeId,
      especialidadeLabel: marcacaoForm.especialidadeLabel,
      organismoId: marcacaoForm.organismoId,
      organismoLabel: marcacaoForm.organismoLabel,
      prioridadeId: '',
      prioridadeLabel: '',
      tipoConsultaId: marcacaoForm.tipoConsultaId,
      tipoConsultaLabel: '',
      data: marcacaoForm.data,
      horaInicio: marcacaoForm.horaInicio,
      horaFim: marcacaoForm.horaFim,
      credencial: marcacaoForm.credencial,
      obs: marcacaoForm.obs,
    }

    setSaving(true)
    try {
      const res = await ListaEsperaAdministrativoService(listPermId).create(
        mapListaEsperaFormToCreatePayload(leForm)
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Adicionado à lista de espera.')
        onOpenChange(false)
        onCreated?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível adicionar.')
      }
    } catch {
      toast.error('Erro ao adicionar à lista de espera.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>Adicionar à lista de espera</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          Cria um registo na lista de espera com os dados actuais do formulário de marcação.
        </p>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' disabled={saving} onClick={handleAdd}>
            {saving ? 'A guardar…' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
