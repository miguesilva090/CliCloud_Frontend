import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { modules } from '@/config/modules'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { toast } from '@/utils/toast-utils'

const permId = modules.areaAdministrativa.permissions.admissoes.id
const LOCAIS_HREF = '/area-comum/tabelas/tratamentos/locais-tratamento'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (localTratamentoId: string) => void
  initialLocalId?: string
}

export function SelecionarLocalTratamentoModal({
  open,
  onOpenChange,
  onConfirm,
  initialLocalId = '',
}: Props) {
  const [localId, setLocalId] = useState(initialLocalId)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      setLocalId(initialLocalId)
      setSearch('')
    }
  }, [open, initialLocalId])

  const locaisQuery = useQuery({
    queryKey: ['adm-trat-modal-locais'],
    enabled: open,
    queryFn: async () => {
      const res = await LocalTratamentoService(permId).getLocaisTratamentoLight()
      return res.info?.data ?? []
    },
  })

  const items = useMemo(() => {
    const list = locaisQuery.data ?? []
    const q = search.trim().toLowerCase()
    return list
      .filter((l: { designacao?: string }) =>
        !q ? true : (l.designacao ?? '').toLowerCase().includes(q)
      )
      .map((l: { id: string; designacao?: string }) => ({
        value: l.id,
        label: l.designacao ?? l.id,
      }))
  }, [locaisQuery.data, search])

  const handleConfirm = () => {
    if (!localId) {
      toast.error('Seleccione um local de tratamento.')
      return
    }
    onConfirm(localId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Local de Tratamento</DialogTitle>
        </DialogHeader>

        <div className='space-y-2 py-2'>
          <Label className='text-xs text-muted-foreground'>
            Local de Tratamento
          </Label>
          <div className='flex gap-2'>
            <div className='min-w-0 flex-1'>
              <AsyncCombobox
                value={localId}
                onChange={setLocalId}
                searchValue={search}
                onSearchValueChange={setSearch}
                items={items}
                isLoading={locaisQuery.isFetching}
                placeholder='Seleccionar local…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
            <Button
              type='button'
              variant='default'
              size='icon'
              className='shrink-0'
              title='Gerir locais'
              onClick={() => window.open(LOCAIS_HREF, '_blank')}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
