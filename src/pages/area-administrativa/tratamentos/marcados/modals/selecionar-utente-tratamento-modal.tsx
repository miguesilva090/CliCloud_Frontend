import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
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
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { toast } from '@/utils/toast-utils'

const permId = modules.areaAdministrativa.permissions.consultas.id
const UTENTES_HREF = '/area-comum/tabelas/entidades/utentes'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (utenteId: string) => void
  initialUtenteId?: string
}

export function SelecionarUtenteTratamentoModal({
  open,
  onOpenChange,
  onConfirm,
  initialUtenteId = '',
}: Props) {
  const [utenteId, setUtenteId] = useState(initialUtenteId)
  const [search, setSearch] = useState('')
  const [debounced] = useDebounce(search, 300)

  useEffect(() => {
    if (open) {
      setUtenteId(initialUtenteId)
      setSearch('')
    }
  }, [open, initialUtenteId])

  const utentesQuery = useQuery({
    queryKey: ['trat-marcados-modal-utentes', debounced],
    enabled: open,
    queryFn: async () => {
      const res = await UtentesService(permId).getUtentesLight(debounced)
      return res.info?.data ?? []
    },
  })

  const items = useMemo(() => {
    const list = utentesQuery.data ?? []
    return list.map(
      (u: { id: string; nome?: string; numeroUtente?: string }) => ({
        value: u.id,
        label: [u.numeroUtente, u.nome].filter(Boolean).join(' — ') || u.id,
      })
    )
  }, [utentesQuery.data])

  const handleConfirm = () => {
    if (!utenteId) {
      toast.error('Seleccione um utente.')
      return
    }
    onConfirm(utenteId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Utente</DialogTitle>
        </DialogHeader>

        <div className='space-y-2 py-2'>
          <Label className='text-xs text-muted-foreground'>Utente</Label>
          <div className='flex gap-2'>
            <div className='min-w-0 flex-1'>
              <AsyncCombobox
                value={utenteId}
                onChange={setUtenteId}
                searchValue={search}
                onSearchValueChange={setSearch}
                items={items}
                isLoading={utentesQuery.isFetching}
                placeholder='Seleccionar utente…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
            <Button
              type='button'
              variant='default'
              size='icon'
              className='shrink-0'
              title='Gerir utentes'
              onClick={() => window.open(UTENTES_HREF, '_blank')}
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
