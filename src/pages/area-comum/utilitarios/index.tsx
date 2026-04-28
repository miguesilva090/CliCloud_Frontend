import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Label } from '@/components/ui/label'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ReplicarPatologiasService } from '@/lib/services/utility/replicar-patologias-service'
import { toast } from '@/utils/toast-utils'

export function UtilitariosPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [origemId, setOrigemId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [searchOrigem, setSearchOrigem] = useState('')
  const [searchDestino, setSearchDestino] = useState('')
  const [itens, setItens] = useState<Array<{ value: string; label: string }>>([])

  const utilitariosEntries = [
    { label: 'Replicar Patologias', path: '/area-comum/utilitarios/replicar-patologias' },
    { label: 'Replicar Subsistemas', path: '/area-comum/utilitarios/replicar-subsistemas' },
    { label: 'Atualizar Subsistemas Por Entidade', path: '/area-comum/utilitarios/atualizar-subsistemas-entidade' },
    { label: 'Replicar Margem/Médicos Consultas', path: '/area-comum/utilitarios/replicar-margem-medicos' },
    { label: 'Fundir Utentes', path: '/area-comum/utilitarios/fundir-utentes' },
  ]

  const activeEntry = useMemo(
    () => utilitariosEntries.find((x) => location.pathname === x.path) ?? null,
    [location.pathname]
  )

  const loadOrganismos = async (q: string) => {
    const r = await OrganismoService().getOrganismoLight(q)
    const data = r.info?.data ?? []
    setItens(data.map((x) => ({ value: x.id, label: x.nome })))
  }

  const replicarPatologiasMutation = useMutation({
    mutationFn: () =>
      ReplicarPatologiasService().replicar({
        organismoOrigemId: origemId,
        organismoDestinoId: destinoId,
        substituirExistentes: false,
      }),
    onSuccess: () => {
      toast.success('Patologias replicadas com sucesso.')
      navigate('/area-comum/utilitarios')
    },
    onError: () => toast.error('Falha ao replicar patologias.'),
  })

  const closeModal = () => {
    setOrigemId('')
    setDestinoId('')
    setSearchOrigem('')
    setSearchDestino('')
    navigate('/area-comum/utilitarios')
  }

  const isReplicarPatologias = activeEntry?.path === '/area-comum/utilitarios/replicar-patologias'

  useEffect(() => {
    if (isReplicarPatologias) {
      void loadOrganismos('')
    }
  }, [isReplicarPatologias])

  return (
    <>
      <PageHead title='Utilitários | Área Comum | CliCloud' />
      <DashboardPageContainer>
        <div />
      </DashboardPageContainer>

      <Dialog open={!!activeEntry} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader className='border-b pb-3'>
            <DialogTitle>{activeEntry?.label ?? 'Utilitários'}</DialogTitle>
          </DialogHeader>

          {isReplicarPatologias ? (
            <div className='space-y-4 pt-2'>
              <div className='space-y-1'>
                <Label>Selecione o Organismo de Origem</Label>
                <div className='grid grid-cols-[1fr_auto] gap-0'>
                  <AsyncCombobox
                    placeholder='Selecione o Organismo de Origem...'
                    items={itens}
                    value={origemId}
                    onChange={setOrigemId}
                    searchValue={searchOrigem}
                    onSearchValueChange={(v) => {
                      setSearchOrigem(v)
                      void loadOrganismos(v)
                    }}
                  />
                  <Button type='button' className='h-9 w-11 rounded-none rounded-r-sm px-0'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='space-y-1'>
                <Label>Selecione o Organismo de Destino</Label>
                <div className='grid grid-cols-[1fr_auto] gap-0'>
                  <AsyncCombobox
                    placeholder='Selecione o Organismo de Destino...'
                    items={itens}
                    value={destinoId}
                    onChange={setDestinoId}
                    searchValue={searchDestino}
                    onSearchValueChange={(v) => {
                      setSearchDestino(v)
                      void loadOrganismos(v)
                    }}
                  />
                  <Button type='button' className='h-9 w-11 rounded-none rounded-r-sm px-0'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='pt-2 text-sm text-muted-foreground'>
              Esta funcionalidade será disponibilizada em seguida.
            </div>
          )}

          <DialogFooter className='border-t pt-4'>
            <Button variant='outline' onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (isReplicarPatologias) {
                  replicarPatologiasMutation.mutate()
                  return
                }
                toast.info('Funcionalidade ainda não implementada.')
                closeModal()
              }}
              disabled={
                replicarPatologiasMutation.isPending ||
                (isReplicarPatologias && (!origemId || !destinoId))
              }
            >
              {replicarPatologiasMutation.isPending ? 'A processar...' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
