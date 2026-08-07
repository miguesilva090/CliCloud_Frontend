import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { AdmissaoTratamentoAdministrativoService } from '@/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client'
import { MotivosDesmarcacaoService } from '@/lib/services/motivos-desmarcacao-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AdmissaoTratamentoTableDTO | null
  listPermId: string
  onDesmarcada?: () => void
}

export function AdmissaoTratamentoDesmarcarModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onDesmarcada,
}: Props) {
  const [motivoId, setMotivoId] = useState('')
  const [motivoSearch, setMotivoSearch] = useState('')
  const [debMotivo] = useDebounce(motivoSearch, 300)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMotivoId('')
      setMotivoSearch('')
    }
  }, [open, row?.id])

  const motivosQ = useQuery({
    queryKey: ['adm-trat-motivos-desmarc', debMotivo],
    queryFn: () =>
      MotivosDesmarcacaoService(listPermId).getMotivosDesmarcacaoLight(debMotivo),
    enabled: open,
  })

  const motivoItems = useMemo(
    () =>
      (motivosQ.data?.info?.data ?? []).map((m) => ({
        value: m.id,
        label: m.descricao,
      })),
    [motivosQ.data]
  )

  const utenteLabel = row
    ? [row.numeroUtente, row.utenteNome].filter(Boolean).join(' — ')
    : ''

  const handleConfirmar = async () => {
    if (!row?.id) return
    if (!motivoId) {
      toast.error('Deve selecionar o motivo da desmarcação')
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoTratamentoAdministrativoService(listPermId).desmarcar(
        row.id,
        { motivoDesmarcacaoId: motivoId }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Sessão desmarcada')
        onOpenChange(false)
        onDesmarcada?.()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível desmarcar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível desmarcar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Motivo de Desmarcação</DialogTitle>
          <DialogDescription>
            {utenteLabel
              ? `Desmarcar a sessão de ${utenteLabel}. O registo deixa de aparecer na lista do dia.`
              : 'Desmarcar esta sessão. O registo deixa de aparecer na lista do dia.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2 py-2'>
          <Label>Tipo de Motivo de Desmarcação</Label>
          <AsyncCombobox
            value={motivoId}
            onChange={setMotivoId}
            searchValue={motivoSearch}
            onSearchValueChange={setMotivoSearch}
            items={motivoItems}
            isLoading={motivosQ.isFetching}
            placeholder='Selecione…'
            searchPlaceholder='Pesquisar motivo…'
            emptyText='Sem motivos'
            disabled={saving}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => void handleConfirmar()}
            disabled={saving}
          >
            {saving ? 'A desmarcar…' : 'Desmarcar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
