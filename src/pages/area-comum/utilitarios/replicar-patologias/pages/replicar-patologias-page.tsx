import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ReplicarPatologiasService } from '@/lib/services/utility/replicar-patologias-service'
import { toast } from '@/utils/toast-utils'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'

export function ReplicarPatologiasPage() {
    const [origemId, setOrigemId] = useState('')
    const [destinoId, setDestinoId] = useState('')
    const [searchOrigem, setSearchOrigem] = useState('')
    const [searchDestino, setSearchDestino] = useState('')

    const [itens, setItens] = useState<Array<{ value: string; label: string }>>([])

    const load = async (q: string ) => {
        const r = await OrganismoService().getOrganismoLight(q)
        const data = r.info?.data ?? []
        setItens(data.map((x) => ({value: x.id, label: x.nome})))
    }

    const replicate = useMutation({
        mutationFn: () => 
            ReplicarPatologiasService().replicar({
                organismoOrigemId: origemId,
                organismoDestinoId: destinoId,
                substituirExistentes: false,
            }),

            onSuccess: () => toast.success('Patologias replicadas com sucesso'),
            onError: () => toast.error('Falha ao replicar patologias'),
    })
    return (
        <>
          <PageHead title='Replicar Patologias | Utilitários | CliCloud' />
          <DashboardPageContainer>
            <AreaComumDashboardCard title='Replicar Patologias'>
              <div className='grid gap-4 md:grid-cols-2'>
                <AsyncCombobox
                  placeholder='Organismo origem...'
                  items={itens}
                  value={origemId}
                  onChange={setOrigemId}
                  searchValue={searchOrigem}
                  onSearchValueChange={(v) => { setSearchOrigem(v); void load(v) }}
                />
                <AsyncCombobox
                  placeholder='Organismo destino...'
                  items={itens}
                  value={destinoId}
                  onChange={setDestinoId}
                  searchValue={searchDestino}
                  onSearchValueChange={(v) => { setSearchDestino(v); void load(v) }}
                />
              </div>
              <div className='mt-4'>
                <Button onClick={() => replicate.mutate()} disabled={!origemId || !destinoId || replicate.isPending}>
                  {replicate.isPending ? 'A replicar...' : 'Replicar'}
                </Button>
              </div>
            </AreaComumDashboardCard>
          </DashboardPageContainer>
        </>
      )
    }
     
