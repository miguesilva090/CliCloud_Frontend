import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { modules } from '@/config/modules'
import { PesquisaVagaTratamentoService } from '@/lib/services/tratamentos/pesquisa-vaga-tratamento-service/pesquisa-vaga-tratamento-client'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type {
  PesquisaVagaResponse,
  PesquisaVagaTecnicoDTO,
} from '@/types/dtos/tratamentos/pesquisa-vaga.dtos'
import { TIPO_TECNICO_LABELS } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'

const permId = modules.areaAdministrativa.permissions.consultas.id

const DIAS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
] as const

function firstError(messages?: Record<string, string[]> | null) {
  return Object.values(messages ?? {}).flat().find(Boolean)
}

function ColunaTecnicos({
  titulo,
  items,
  onSelect,
}: {
  titulo: string
  items: PesquisaVagaTecnicoDTO[]
  onSelect: (t: PesquisaVagaTecnicoDTO) => void
}) {
  return (
    <div className='space-y-2 rounded border p-3'>
      <h3 className='text-sm font-medium'>{titulo}</h3>
      {items.length === 0 ? (
        <p className='text-xs text-muted-foreground'>Sem resultados</p>
      ) : (
        <div className='flex flex-col gap-1'>
          {items.map((t) => (
            <Button
              key={t.tecnicoId}
              type='button'
              variant='outline'
              size='sm'
              className='justify-start'
              onClick={() => onSelect(t)}
            >
              {t.nome || t.tecnicoId}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PesquisaVagaPage() {
  const navigate = useNavigate()
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('09:00')
  const [numeroSessoes, setNumeroSessoes] = useState(10)
  const [unidadeTempo, setUnidadeTempo] = useState(1)
  const [modo, setModo] = useState<'consecutivo' | 'dias'>('consecutivo')
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5])
  const [resultado, setResultado] = useState<PesquisaVagaResponse | null>(null)

  const total = useMemo(() => {
    if (!resultado) return 0
    return (
      resultado.fisioterapeutas.length +
      resultado.auxiliares.length +
      resultado.outros.length
    )
  }, [resultado])

  const mutation = useMutation({
    mutationFn: () =>
      PesquisaVagaTratamentoService(permId).pesquisar({
        dataInicio,
        hora,
        numeroSessoes,
        unidadeTempo,
        diasConsecutivos: modo === 'consecutivo',
        diasSemana: modo === 'dias' ? diasSemana : undefined,
      }),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        setResultado(res.info.data)
      } else {
        setResultado(null)
        toast.error(firstError(res.info?.messages) ?? 'Pesquisa sem resultados.')
      }
    },
    onError: () => {
      setResultado(null)
      toast.error('Erro ao pesquisar vagas.')
    },
  })

  const limpar = () => {
    setResultado(null)
    setDataInicio(new Date().toISOString().slice(0, 10))
    setHora('09:00')
    setNumeroSessoes(10)
    setUnidadeTempo(1)
    setModo('consecutivo')
    setDiasSemana([1, 2, 3, 4, 5])
  }

  const abrirPlanning = (t: PesquisaVagaTecnicoDTO) => {
    const qs = new URLSearchParams({
      tipoTecnico: String(t.tipoTecnico),
      tecnicoId: t.tecnicoId,
      ...(t.nome ? { tecnicoNome: t.nome } : {}),
    })
    navigate(`/area-administrativa/tratamentos/planning?${qs.toString()}`)
  }

  const toggleDia = (d: number) => {
    setDiasSemana((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  return (
    <>
      <PageHead title='Pesquisa de Vaga | Tratamentos' />
      <DashboardPageContainer>
        <AreaComumDashboardCard>
          <div className='space-y-4'>
            <div>
              <h1 className='text-lg font-semibold'>Pesquisa de Vaga</h1>
              <p className='text-sm text-muted-foreground'>
                Encontra técnicos com disponibilidade para N sessões à mesma hora.
              </p>
            </div>

            <div className='grid gap-4 md:grid-cols-4'>
              <div className='space-y-1.5'>
                <Label>Data início</Label>
                <Input
                  type='date'
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Hora</Label>
                <Input
                  type='time'
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Nº sessões</Label>
                <Input
                  type='number'
                  min={1}
                  value={numeroSessoes}
                  onChange={(e) => setNumeroSessoes(Number(e.target.value || 1))}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>U. Tempo</Label>
                <Input
                  type='number'
                  min={1}
                  value={unidadeTempo}
                  onChange={(e) => setUnidadeTempo(Number(e.target.value || 1))}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Frequência</Label>
              <RadioGroup
                value={modo}
                onValueChange={(v) => setModo(v as 'consecutivo' | 'dias')}
                className='flex flex-wrap gap-4'
              >
                <label className='flex items-center gap-2 text-sm'>
                  <RadioGroupItem value='consecutivo' />
                  Dias consecutivos
                </label>
                <label className='flex items-center gap-2 text-sm'>
                  <RadioGroupItem value='dias' />
                  Selecionar os dias
                </label>
              </RadioGroup>
            </div>

            {modo === 'dias' ? (
              <div className='flex flex-wrap gap-3'>
                {DIAS.map((d) => (
                  <label key={d.value} className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={diasSemana.includes(d.value)}
                      onCheckedChange={() => toggleDia(d.value)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            ) : null}

            <div className='flex gap-2'>
              <Button
                type='button'
                disabled={mutation.isPending}
                onClick={() => {
                  if (!dataInicio || !hora) {
                    toast.error('Preencha data e hora.')
                    return
                  }
                  if (modo === 'dias' && diasSemana.length === 0) {
                    toast.error('Tem de selecionar os dias')
                    return
                  }
                  mutation.mutate()
                }}
              >
                {mutation.isPending ? 'A pesquisar…' : 'Pesquisar'}
              </Button>
              <Button type='button' variant='outline' onClick={limpar}>
                Limpar
              </Button>
            </div>

            {resultado ? (
              <p className='text-sm text-muted-foreground'>
                {total} técnico(s) disponível(eis). Clique para abrir o Planning.
              </p>
            ) : null}

            <div className='grid gap-3 md:grid-cols-3'>
              <ColunaTecnicos
                titulo={TIPO_TECNICO_LABELS[1]}
                items={resultado?.fisioterapeutas ?? []}
                onSelect={abrirPlanning}
              />
              <ColunaTecnicos
                titulo={TIPO_TECNICO_LABELS[2]}
                items={resultado?.auxiliares ?? []}
                onSelect={abrirPlanning}
              />
              <ColunaTecnicos
                titulo={TIPO_TECNICO_LABELS[3]}
                items={resultado?.outros ?? []}
                onSelect={abrirPlanning}
              />
            </div>
          </div>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}