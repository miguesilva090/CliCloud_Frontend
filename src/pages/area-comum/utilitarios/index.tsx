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
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { ReplicarPatologiasService } from '@/lib/services/utility/replicar-patologias-service'
import { ReplicarSubsistemasService } from '@/lib/services/utility/replicar-subsistemas-service'
import { AtualizarSubsistemasEntidadeService } from '@/lib/services/utility/atualizar-subsistemas-entidade-service'
import { ReplicarMargemMedicosService } from '@/lib/services/utility/replicar-margem-medicos-service'
import { toast } from '@/utils/toast-utils'

export function UtilitariosPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [origemId, setOrigemId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [searchOrigem, setSearchOrigem] = useState('')
  const [searchDestino, setSearchDestino] = useState('')
  const [itensOrganismos, setItensOrganismos] = useState<Array<{ value: string; label: string }>>([])
  const [itensMedicos, setItensMedicos] = useState<Array<{ value: string; label: string }>>([])

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
    setItensOrganismos(data.map((x) => ({ value: x.id, label: x.nome })))
  }

  const loadMedicos = async (q: string) => {
    const r = await MedicosService('medicos').getMedicosLight(q)
    const data = r.info?.data ?? []
    setItensMedicos(data.map((x) => ({ value: x.id, label: x.nome })))
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

  const replicarSubsistemasMutation = useMutation({
    mutationFn: () =>
      ReplicarSubsistemasService().replicar({
        organismoOrigemId: origemId,
        organismoDestinoId: destinoId,
      }),
    onSuccess: () => {
      toast.success('Subsistemas replicados com sucesso.')
      navigate('/area-comum/utilitarios')
    },
    onError: () => toast.error('Falha ao replicar subsistemas.'),
  })

  const atualizarSubsistemasEntidadeMutation = useMutation({
    mutationFn: () =>
      AtualizarSubsistemasEntidadeService().atualizar({
        organismoOrigemId: origemId,
        organismoDestinoId: destinoId,
      }),
    onSuccess: () => {
      toast.success('Subsistemas atualizados com sucesso.')
      navigate('/area-comum/utilitarios')
    },
    onError: () => toast.error('Falha ao atualizar subsistemas por entidade.'),
  })

  const replicarMargemMedicosMutation = useMutation({
    mutationFn: () =>
      ReplicarMargemMedicosService().replicar({
        medicoOrigemId: origemId,
        medicoDestinoId: destinoId,
      }),
    onSuccess: () => {
      toast.success('Margens dos médicos replicadas com sucesso.')
      navigate('/area-comum/utilitarios')
    },
    onError: () => toast.error('Falha ao replicar margem dos médicos.'),
  })

  const closeModal = () => {
    setOrigemId('')
    setDestinoId('')
    setSearchOrigem('')
    setSearchDestino('')
    navigate('/area-comum/utilitarios')
  }

  const isReplicarPatologias = activeEntry?.path === '/area-comum/utilitarios/replicar-patologias'
  const isReplicarSubsistemas = activeEntry?.path === '/area-comum/utilitarios/replicar-subsistemas'
  const isAtualizarSubsistemasEntidade =
    activeEntry?.path === '/area-comum/utilitarios/atualizar-subsistemas-entidade'
  const isReplicarMargemMedicos =
    activeEntry?.path === '/area-comum/utilitarios/replicar-margem-medicos'

  useEffect(() => {
    if (isReplicarPatologias || isReplicarSubsistemas || isAtualizarSubsistemasEntidade) {
      void loadOrganismos('')
    }
    if (isReplicarMargemMedicos) {
      void loadMedicos('')
    }
  }, [isReplicarPatologias, isReplicarSubsistemas, isAtualizarSubsistemasEntidade, isReplicarMargemMedicos])

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

          {isReplicarPatologias || isReplicarSubsistemas || isAtualizarSubsistemasEntidade || isReplicarMargemMedicos ? (
            <div className='space-y-4 pt-2'>
              <div className='space-y-1'>
                <Label>
                  {isReplicarMargemMedicos ? 'Selecione o Médico de Origem' : 'Selecione o Organismo de Origem'}
                </Label>
                <div className='grid grid-cols-[1fr_auto] gap-0'>
                  <AsyncCombobox
                    placeholder={isReplicarMargemMedicos ? 'Selecione o Médico de Origem...' : 'Selecione o Organismo de Origem...'}
                    items={isReplicarMargemMedicos ? itensMedicos : itensOrganismos}
                    value={origemId}
                    onChange={setOrigemId}
                    searchValue={searchOrigem}
                    onSearchValueChange={(v) => {
                      setSearchOrigem(v)
                      if (isReplicarMargemMedicos) {
                        void loadMedicos(v)
                      } else {
                        void loadOrganismos(v)
                      }
                    }}
                  />
                  <Button type='button' className='h-9 w-11 rounded-none rounded-r-sm px-0'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='space-y-1'>
                <Label>
                  {isReplicarMargemMedicos ? 'Selecione o Médico de Destino' : 'Selecione o Organismo de Destino'}
                </Label>
                <div className='grid grid-cols-[1fr_auto] gap-0'>
                  <AsyncCombobox
                    placeholder={isReplicarMargemMedicos ? 'Selecione o Médico de Destino...' : 'Selecione o Organismo de Destino...'}
                    items={isReplicarMargemMedicos ? itensMedicos : itensOrganismos}
                    value={destinoId}
                    onChange={setDestinoId}
                    searchValue={searchDestino}
                    onSearchValueChange={(v) => {
                      setSearchDestino(v)
                      if (isReplicarMargemMedicos) {
                        void loadMedicos(v)
                      } else {
                        void loadOrganismos(v)
                      }
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
                if (isReplicarSubsistemas) {
                  replicarSubsistemasMutation.mutate()
                  return
                }
                if (isAtualizarSubsistemasEntidade) {
                  atualizarSubsistemasEntidadeMutation.mutate()
                  return
                }
                if (isReplicarMargemMedicos) {
                  replicarMargemMedicosMutation.mutate()
                  return
                }
                toast.info('Funcionalidade ainda não implementada.')
                closeModal()
              }}
              disabled={
                replicarPatologiasMutation.isPending ||
                replicarSubsistemasMutation.isPending ||
                atualizarSubsistemasEntidadeMutation.isPending ||
                replicarMargemMedicosMutation.isPending ||
                (isReplicarPatologias && (!origemId || !destinoId))
                || (isReplicarSubsistemas && (!origemId || !destinoId))
                || (isAtualizarSubsistemasEntidade && (!origemId || !destinoId))
                || (isReplicarMargemMedicos && (!origemId || !destinoId))
              }
            >
              {replicarPatologiasMutation.isPending || replicarSubsistemasMutation.isPending || atualizarSubsistemasEntidadeMutation.isPending || replicarMargemMedicosMutation.isPending ? 'A processar...' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
