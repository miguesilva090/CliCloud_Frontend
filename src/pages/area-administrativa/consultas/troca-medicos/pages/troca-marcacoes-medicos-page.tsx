import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Calendar, RotateCw } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { getDataTrabalhoIsoDate } from '@/lib/utils/data-trabalho'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import type { TrocaMarcacoesMedicosPreviewDTO } from '@/types/dtos/consultas/troca-marcacoes-medicos.dtos'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export function TrocaMarcacoesMedicosPage() {
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const defaultDate = getDataTrabalhoIsoDate()

  const [medicoOrigemId, setMedicoOrigemId] = useState('')
  const [medicoDestinoId, setMedicoDestinoId] = useState('')
  const [dataOrigem, setDataOrigem] = useState(defaultDate)
  const [dataDestino, setDataDestino] = useState(defaultDate)
  const [medOrigSearch, setMedOrigSearch] = useState('')
  const [medDestSearch, setMedDestSearch] = useState('')
  const [debouncedOrig] = useDebounce(medOrigSearch, 300)
  const [debouncedDest] = useDebounce(medDestSearch, 300)
  const [preview, setPreview] = useState<TrocaMarcacoesMedicosPreviewDTO | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [executing, setExecuting] = useState(false)

  const medicosOrigQuery = useQuery({
    queryKey: ['troca-med', 'orig', debouncedOrig],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedOrig),
  })

  const medicosDestQuery = useQuery({
    queryKey: ['troca-med', 'dest', debouncedDest],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedDest),
  })

  const medicoItems = (data: typeof medicosOrigQuery.data) => {
    const list = (data?.info?.data ?? []) as Array<{ id: string; nome: string }>
    return list.map((m) => ({ value: m.id, label: m.nome }))
  }

  const buildPayload = () => ({
    medicoOrigemId,
    medicoDestinoId,
    dataOrigem: `${dataOrigem}T00:00:00`,
    dataDestino: `${dataDestino}T00:00:00`,
  })

  const handlePreview = async () => {
    if (!medicoOrigemId || !medicoDestinoId) {
      toast.error('Selecione médico de origem e destino.')
      return
    }
    if (medicoOrigemId === medicoDestinoId) {
      toast.error('Os médicos devem ser diferentes.')
      return
    }

    setLoadingPreview(true)
    setPreview(null)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).previewTrocaMedicos(
        buildPayload()
      )
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        setPreview(res.info.data)
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível obter pré-visualização.')
      }
    } catch {
      toast.error('Erro na pré-visualização.')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleExecutar = async () => {
    if (!preview?.podeExecutar) {
      toast.error('Resolva os conflitos antes de executar.')
      return
    }
    if (!window.confirm(`Transferir ${preview.totalOrigem} marcação(ões)?`)) return

    setExecuting(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).executarTrocaMedicos(
        buildPayload()
      )
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        toast.success(
          `${res.info.data.quantidadeTransferida} marcação(ões) transferida(s).`
        )
        setPreview(null)
        navigate('/area-administrativa/consultas/marcacoes')
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível executar a troca.')
      }
    } catch {
      toast.error('Erro ao executar troca.')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <>
      <PageHead title='Troca de Marcações entre Médicos | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard title='Troca de Marcações entre Médicos'>
          <div className='mb-4 flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                closeLikeTabBar()
                navigate('/area-administrativa/consultas/marcacoes')
              }}
            >
              Voltar à agenda
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => navigate('/area-administrativa/consultas/marcacoes')}
            >
              <Calendar className='mr-1 h-4 w-4' />
              Agenda
            </Button>
          </div>

          <div className='grid max-w-3xl gap-4 sm:grid-cols-2'>
            <div>
              <Label>Médico origem</Label>
              <AsyncCombobox
                value={medicoOrigemId}
                onChange={setMedicoOrigemId}
                searchValue={medOrigSearch}
                onSearchValueChange={setMedOrigSearch}
                items={medicoItems(medicosOrigQuery.data)}
                isLoading={medicosOrigQuery.isFetching}
                placeholder='Médico…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
            <div>
              <Label>Médico destino</Label>
              <AsyncCombobox
                value={medicoDestinoId}
                onChange={setMedicoDestinoId}
                searchValue={medDestSearch}
                onSearchValueChange={setMedDestSearch}
                items={medicoItems(medicosDestQuery.data)}
                isLoading={medicosDestQuery.isFetching}
                placeholder='Médico…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
            <div>
              <Label>Data origem</Label>
              <Input
                type='date'
                className='mt-1'
                value={dataOrigem}
                onChange={(e) => setDataOrigem(e.target.value)}
              />
            </div>
            <div>
              <Label>Data destino</Label>
              <Input
                type='date'
                className='mt-1'
                value={dataDestino}
                onChange={(e) => setDataDestino(e.target.value)}
              />
            </div>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={loadingPreview}
              onClick={handlePreview}
            >
              <RotateCw className='mr-1 h-4 w-4' />
              {loadingPreview ? 'A carregar…' : 'Pré-visualizar'}
            </Button>
            <Button
              type='button'
              disabled={!preview?.podeExecutar || executing}
              onClick={handleExecutar}
            >
              {executing ? 'A executar…' : 'Executar troca'}
            </Button>
          </div>

          {preview ? (
            <div className='mt-6 space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Total na origem: <strong>{preview.totalOrigem}</strong>
                {preview.podeExecutar ? '' : ' — existem conflitos'}
              </p>

              {preview.conflitos.length > 0 ? (
                <Alert variant='destructive'>
                  <AlertTitle>Conflitos ({preview.conflitos.length})</AlertTitle>
                  <AlertDescription>
                    <ul className='mt-2 list-disc pl-5 text-sm'>
                      {preview.conflitos.map((c, i) => (
                        <li key={`${c.codigo}-${i}`}>
                          {c.utenteNome ?? '—'} {c.horaInicio ? `@ ${c.horaInicio}` : ''}:{' '}
                          {c.mensagem}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}

              {preview.itens.length > 0 ? (
                <div className='overflow-x-auto rounded-md border'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-3 py-2 text-left'>Utente</th>
                        <th className='px-3 py-2 text-left'>Hora</th>
                        <th className='px-3 py-2 text-left'>Especialidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.itens.map((item) => (
                        <tr key={item.marcacaoId} className='border-t'>
                          <td className='px-3 py-2'>
                            {item.utenteNome}
                            {item.utenteNumero != null ? ` (${item.utenteNumero})` : ''}
                          </td>
                          <td className='px-3 py-2'>{item.horaInicio ?? '—'}</td>
                          <td className='px-3 py-2'>
                            {item.especialidadeDesignacao ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>Sem marcações a transferir.</p>
              )}
            </div>
          ) : null}
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
