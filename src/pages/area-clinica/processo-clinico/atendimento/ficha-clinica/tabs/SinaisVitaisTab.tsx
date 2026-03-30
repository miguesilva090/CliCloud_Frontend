import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import { formatDateForDisplay } from '@/utils/date-utils'
import {
  useGetTensaoArterialPaginated,
  useCreateTensaoArterial,
  useUpdateTensaoArterial,
  useDeleteTensaoArterial,
} from '../queries/tensao-arterial-queries'
import {
  useGetGlicemiaCapilarPaginated,
  useCreateGlicemiaCapilar,
  useUpdateGlicemiaCapilar,
  useDeleteGlicemiaCapilar,
} from '../queries/glicemia-capilar-queries'
import {
  useGetTemperaturaCorporalPaginated,
  useCreateTemperaturaCorporal,
  useUpdateTemperaturaCorporal,
  useDeleteTemperaturaCorporal,
} from '../queries/temperatura-corporal-queries'
import {
  useGetIndiceMassaCorporalPaginated,
  useCreateIndiceMassaCorporal,
  useUpdateIndiceMassaCorporal,
  useDeleteIndiceMassaCorporal,
} from '../queries/indice-massa-corporal-queries'
import {
  useGetGorduraMassaMuscularPaginated,
  useCreateGorduraMassaMuscular,
  useUpdateGorduraMassaMuscular,
  useDeleteGorduraMassaMuscular,
} from '../queries/gordura-massa-muscular-queries'
import {
  useGetAvaliacaoAntropometricaPaginated,
  useCreateAvaliacaoAntropometrica,
  useUpdateAvaliacaoAntropometrica,
  useDeleteAvaliacaoAntropometrica,
} from '../queries/avaliacao-antropometrica-queries'
import {
  useGetAvaliacaoPosturalPaginated,
  useCreateAvaliacaoPostural,
  useUpdateAvaliacaoPostural,
  useDeleteAvaliacaoPostural,
} from '../queries/avaliacao-postural-queries'
import type {
  TensaoArterialTableDTO,
  CreateTensaoArterialRequest,
} from '@/types/dtos/sinais-vitais/tensao-arterial.dtos'
import type {
  GlicemiaCapilarTableDTO,
  CreateGlicemiaCapilarRequest,
} from '@/types/dtos/sinais-vitais/glicemia-capilar.dtos'
import type {
  TemperaturaCorporalTableDTO,
  CreateTemperaturaCorporalRequest,
} from '@/types/dtos/sinais-vitais/temperatura-corporal.dtos'
import type {
  IndiceMassaCorporalTableDTO,
  CreateIndiceMassaCorporalRequest,
} from '@/types/dtos/sinais-vitais/indice-massa-corporal.dtos'
import type { GorduraMassaMuscularTableDTO } from '@/types/dtos/sinais-vitais/gordura-massa-muscular.dtos'
import type { AvaliacaoAntropometricaTableDTO } from '@/types/dtos/sinais-vitais/avaliacao-antropometrica.dtos'
import type { AvaliacaoPosturalTableDTO } from '@/types/dtos/sinais-vitais/avaliacao-postural.dtos'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'

export interface SinaisVitaisTabProps {
  utenteId?: string
  utenteNome?: string
}

export function SinaisVitaisTab({ utenteId = '', utenteNome }: SinaisVitaisTabProps) {
  const [pageNumber] = useState(1)
  const [pageSize] = useState(100)

  const { data: tensoesData } = useGetTensaoArterialPaginated(
    utenteId,
    pageNumber,
    pageSize
  )
  const tensoes = (tensoesData?.info?.data ?? []) as TensaoArterialTableDTO[]

  const { data: glicemiasData } = useGetGlicemiaCapilarPaginated(
    utenteId,
    pageNumber,
    pageSize
  )
  const glicemias = (glicemiasData?.info?.data ?? []) as GlicemiaCapilarTableDTO[]

  const { data: temperaturasData } = useGetTemperaturaCorporalPaginated(
    utenteId,
    pageNumber,
    pageSize
  )
  const temperaturas = (temperaturasData?.info?.data ?? []) as TemperaturaCorporalTableDTO[]

  const { data: imcsData } = useGetIndiceMassaCorporalPaginated(
    utenteId,
    pageNumber,
    pageSize
  )
  const imcs = (imcsData?.info?.data ?? []) as IndiceMassaCorporalTableDTO[]

  const createTensao = useCreateTensaoArterial(utenteId)
  const updateTensao = useUpdateTensaoArterial(utenteId)
  const deleteTensao = useDeleteTensaoArterial(utenteId)

  const createGlicemia = useCreateGlicemiaCapilar(utenteId)
  const updateGlicemia = useUpdateGlicemiaCapilar(utenteId)
  const deleteGlicemia = useDeleteGlicemiaCapilar(utenteId)

  const createTemperatura = useCreateTemperaturaCorporal(utenteId)
  const updateTemperatura = useUpdateTemperaturaCorporal(utenteId)
  const deleteTemperatura = useDeleteTemperaturaCorporal(utenteId)

  const createImc = useCreateIndiceMassaCorporal(utenteId)
  const updateImc = useUpdateIndiceMassaCorporal(utenteId)
  const deleteImc = useDeleteIndiceMassaCorporal(utenteId)

  const { data: gorduraData } = useGetGorduraMassaMuscularPaginated(utenteId, 1, 100)
  const gorduraRecords = (gorduraData?.info?.data ?? []) as GorduraMassaMuscularTableDTO[]
  const createGordura = useCreateGorduraMassaMuscular(utenteId)
  const updateGordura = useUpdateGorduraMassaMuscular(utenteId)
  const deleteGordura = useDeleteGorduraMassaMuscular(utenteId)

  const { data: antropometricaData } = useGetAvaliacaoAntropometricaPaginated(utenteId, 1, 100)
  const antropometricaRecords = (antropometricaData?.info?.data ?? []) as AvaliacaoAntropometricaTableDTO[]
  const createAntropometrica = useCreateAvaliacaoAntropometrica(utenteId)
  const updateAntropometrica = useUpdateAvaliacaoAntropometrica(utenteId)
  const deleteAntropometrica = useDeleteAvaliacaoAntropometrica(utenteId)

  const { data: posturalData } = useGetAvaliacaoPosturalPaginated(utenteId, 1, 100)
  const posturalRecords = (posturalData?.info?.data ?? []) as AvaliacaoPosturalTableDTO[]
  const createPostural = useCreateAvaliacaoPostural(utenteId)
  const updatePostural = useUpdateAvaliacaoPostural(utenteId)
  const deletePostural = useDeleteAvaliacaoPostural(utenteId)

  const getNowDatetime = () => {
    const now = new Date()
    const data = now.toISOString().slice(0, 10)
    const hora = now.toTimeString().slice(0, 5)
    return { data, hora }
  }

  const formatHoraForApi = (hora: string) => {
    if (!hora) return hora
    const parts = hora.split(':')
    if (parts.length === 2) {
      const now = new Date()
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${parts[0]}:${parts[1]}:${seconds}`
    }
    return hora
  }

  const initialDatetime = getNowDatetime()

  const [selectedTensaoIds, setSelectedTensaoIds] = useState<string[]>([])
  const [editingTensao, setEditingTensao] = useState<TensaoArterialTableDTO | null>(null)
  const [tensaoForm, setTensaoForm] = useState({
    data: initialDatetime.data,
    hora: initialDatetime.hora,
    tensaoSistolica: '',
    tensaoDiastolica: '',
    observacoes: '',
  })

  const [selectedGlicemiaIds, setSelectedGlicemiaIds] = useState<string[]>([])
  const [editingGlicemia, setEditingGlicemia] = useState<GlicemiaCapilarTableDTO | null>(
    null
  )
  const [glicemiaForm, setGlicemiaForm] = useState({
    data: initialDatetime.data,
    hora: initialDatetime.hora,
    glicemia: '',
    observacoes: '',
  })

  const [selectedTemperaturaIds, setSelectedTemperaturaIds] = useState<string[]>([])
  const [editingTemperatura, setEditingTemperatura] =
    useState<TemperaturaCorporalTableDTO | null>(null)
  const [temperaturaForm, setTemperaturaForm] = useState({
    data: initialDatetime.data,
    hora: initialDatetime.hora,
    temperatura: '',
    observacoes: '',
  })

  const [selectedImcIds, setSelectedImcIds] = useState<string[]>([])
  const [editingImc, setEditingImc] = useState<IndiceMassaCorporalTableDTO | null>(null)
  const [imcForm, setImcForm] = useState({
    data: initialDatetime.data,
    hora: initialDatetime.hora,
    peso: '',
    altura: '',
    observacoes: '',
  })

  const tensaoChartData = useMemo(
    () =>
      tensoes
        .slice()
        .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
        .map((item) => ({
          label: formatDateForDisplay(item.data),
          tensaoSistolica: item.tensaoSistolica,
          tensaoDiastolica: item.tensaoDiastolica,
        })),
    [tensoes]
  )

  const glicemiaChartData = useMemo(
    () =>
      glicemias
        .slice()
        .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
        .map((item) => ({
          label: formatDateForDisplay(item.data),
          glicemia: item.glicemia,
        })),
    [glicemias]
  )

  const temperaturaChartData = useMemo(
    () =>
      temperaturas
        .slice()
        .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
        .map((item) => ({
          label: formatDateForDisplay(item.data),
          temperatura: item.temperatura,
        })),
    [temperaturas]
  )

  const imcChartData = useMemo(
    () =>
      imcs
        .slice()
        .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
        .map((item) => {
          const imc =
            item.altura > 0 ? Number((item.peso / (item.altura * item.altura)).toFixed(2)) : 0
          return {
            label: formatDateForDisplay(item.data),
            peso: item.peso,
            altura: item.altura,
            imc,
          }
        }),
    [imcs]
  )

  const handleSelectTensaoRow = (id: string, checked: boolean) => {
    setSelectedTensaoIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const handleInsertTensao = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }

    const sistolica = Number(tensaoForm.tensaoSistolica)
    const diastolica = Number(tensaoForm.tensaoDiastolica)

    if (!sistolica || sistolica <= 0 || !diastolica || diastolica <= 0) {
      toast.error('Tensão sistólica e diastólica devem ser maiores que zero.')
      return
    }

    const payload: Omit<CreateTensaoArterialRequest, 'utenteId'> = {
      data: tensaoForm.data,
      hora: formatHoraForApi(tensaoForm.hora),
      tensaoSistolica: sistolica,
      tensaoDiastolica: diastolica,
      observacoes: tensaoForm.observacoes || null,
    }

    try {
      if (editingTensao) {
        await updateTensao.mutateAsync({
          id: editingTensao.id,
          data: payload,
        })
        toast.success('Tensão arterial atualizada com sucesso.')
      } else {
        await createTensao.mutateAsync(payload)
        toast.success('Tensão arterial criada com sucesso.')
      }
      setEditingTensao(null)
      const { data, hora } = getNowDatetime()
      setTensaoForm({
        data,
        hora,
        tensaoSistolica: '',
        tensaoDiastolica: '',
        observacoes: '',
      })
    } catch (err: unknown) {
      console.error('Erro ao guardar tensão arterial:', err)
      const msg =
        err instanceof Error ? err.message : 'Erro ao guardar tensão arterial.'
      toast.error(msg)
    }
  }

  const handleEditTensao = (row: TensaoArterialTableDTO) => {
    setEditingTensao(row)
    setTensaoForm({
      data: row.data,
      hora: row.hora,
      tensaoSistolica: String(row.tensaoSistolica),
      tensaoDiastolica: String(row.tensaoDiastolica),
      observacoes: '',
    })
  }

  const handleRemoveTensao = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (selectedTensaoIds.length === 0) {
      toast.error('Selecione pelo menos um registo para remover.')
      return
    }
    try {
      await deleteTensao.mutateAsync(selectedTensaoIds)
      toast.success('Registo(s) removido(s) com sucesso.')
      setSelectedTensaoIds([])
    } catch {
      toast.error('Erro ao remover registos de tensão arterial.')
    }
  }

  const handleInsertGlicemia = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }

    const glicemiaNum = Number(glicemiaForm.glicemia)
    if (!glicemiaNum || glicemiaNum <= 0) {
      toast.error('O valor de glicemia deve ser maior que zero.')
      return
    }

    const payload: Omit<CreateGlicemiaCapilarRequest, 'utenteId'> = {
      data: glicemiaForm.data,
      hora: formatHoraForApi(glicemiaForm.hora),
      glicemia: glicemiaNum,
      observacoes: glicemiaForm.observacoes || null,
    }

    try {
      if (editingGlicemia) {
        await updateGlicemia.mutateAsync({
          id: editingGlicemia.id,
          data: payload,
        })
        toast.success('Glicemia atualizada com sucesso.')
      } else {
        await createGlicemia.mutateAsync(payload)
        toast.success('Glicemia criada com sucesso.')
      }
      setEditingGlicemia(null)
      const { data, hora } = getNowDatetime()
      setGlicemiaForm({
        data,
        hora,
        glicemia: '',
        observacoes: '',
      })
    } catch (err: unknown) {
      console.error('Erro ao guardar glicemia:', err)
      const msg = err instanceof Error ? err.message : 'Erro ao guardar glicemia.'
      toast.error(msg)
    }
  }

  const handleInsertTemperatura = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }

    const temperaturaNum = Number(temperaturaForm.temperatura)
    if (!temperaturaNum || temperaturaNum <= 0) {
      toast.error('A temperatura deve ser maior que zero.')
      return
    }

    const payload: Omit<CreateTemperaturaCorporalRequest, 'utenteId'> = {
      data: temperaturaForm.data,
      hora: formatHoraForApi(temperaturaForm.hora),
      temperatura: temperaturaNum,
      observacoes: temperaturaForm.observacoes || null,
    }

    try {
      if (editingTemperatura) {
        await updateTemperatura.mutateAsync({
          id: editingTemperatura.id,
          data: payload,
        })
        toast.success('Temperatura atualizada com sucesso.')
      } else {
        await createTemperatura.mutateAsync(payload)
        toast.success('Temperatura criada com sucesso.')
      }
      setEditingTemperatura(null)
      const { data, hora } = getNowDatetime()
      setTemperaturaForm({
        data,
        hora,
        temperatura: '',
        observacoes: '',
      })
    } catch (err: unknown) {
      console.error('Erro ao guardar temperatura:', err)
      const msg = err instanceof Error ? err.message : 'Erro ao guardar temperatura.'
      toast.error(msg)
    }
  }

  const handleInsertImc = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }

    const pesoNum = Number(imcForm.peso)
    const alturaNum = Number(imcForm.altura)

    if (!pesoNum || pesoNum <= 0 || !alturaNum || alturaNum <= 0) {
      toast.error('Peso e altura devem ser maiores que zero.')
      return
    }

    const payload: Omit<CreateIndiceMassaCorporalRequest, 'utenteId'> = {
      data: imcForm.data,
      hora: formatHoraForApi(imcForm.hora),
      peso: pesoNum,
      altura: alturaNum,
      observacoes: imcForm.observacoes || null,
    }

    try {
      if (editingImc) {
        await updateImc.mutateAsync({
          id: editingImc.id,
          data: payload,
        })
        toast.success('IMC atualizado com sucesso.')
      } else {
        await createImc.mutateAsync(payload)
        toast.success('IMC criado com sucesso.')
      }
      setEditingImc(null)
      const { data, hora } = getNowDatetime()
      setImcForm({
        data,
        hora,
        peso: '',
        altura: '',
        observacoes: '',
      })
    } catch (err: unknown) {
      console.error('Erro ao guardar IMC:', err)
      const msg = err instanceof Error ? err.message : 'Erro ao guardar IMC.'
      toast.error(msg)
    }
  }

  return (
    <Tabs defaultValue='tensao' className='flex flex-col gap-2'>
      <TabsList className='w-full justify-start bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='tensao' className='tabs-pill px-2 py-1'>
          Tensão Arterial
        </TabsTrigger>
        <TabsTrigger value='glicemia' className='tabs-pill px-2 py-1'>
          Glicemia Capilar
        </TabsTrigger>
        <TabsTrigger value='temperatura' className='tabs-pill px-2 py-1'>
          Temperatura Corporal
        </TabsTrigger>
        <TabsTrigger value='imc' className='tabs-pill px-2 py-1'>
          IMC (Índice Massa Corporal)
        </TabsTrigger>
        <TabsTrigger value='gordura' className='tabs-pill px-2 py-1'>
          Gordura/Massa Muscular
        </TabsTrigger>
        <TabsTrigger value='antropometrica' className='tabs-pill px-2 py-1'>
          Avaliação Antropometrica
        </TabsTrigger>
        <TabsTrigger value='postural' className='tabs-pill px-2 py-1'>
          Avaliação Postural
        </TabsTrigger>
      </TabsList>

      <TabsContent value='tensao' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <h3 className='mb-2 text-base font-semibold text-teal-700'>Tensão Arterial</h3>
        <div className='mb-2 flex items-center gap-2'>
          <Button
            size='sm'
            className='gap-1 bg-teal-600 hover:bg-teal-700'
            onClick={handleInsertTensao}
          >
            <Plus className='h-4 w-4' /> Inserir
          </Button>
          <Button
            size='sm'
            variant='destructive'
            className='gap-1'
            onClick={handleRemoveTensao}
            disabled={selectedTensaoIds.length === 0}
          >
            <X className='h-4 w-4' /> Remover
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]'>
          <div className='space-y-2'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        tensoes.length > 0 && selectedTensaoIds.length === tensoes.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTensaoIds(tensoes.map((t) => t.id))
                        } else {
                          setSelectedTensaoIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tensão Diastólica</TableHead>
                  <TableHead>Tensão Sistólica</TableHead>
                  <TableHead>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tensoes.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTensaoIds.includes(row.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTensaoRow(row.id, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDateForDisplay(row.data)}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>{row.tensaoDiastolica}</TableCell>
                    <TableCell>{row.tensaoSistolica}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEditTensao(row)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tensoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center text-muted-foreground'>
                      Nenhum registo de tensão arterial.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className='mt-2 space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  value={tensaoForm.data}
                  onChange={(e) =>
                    setTensaoForm((f) => ({ ...f, data: e.target.value }))
                  }
                  placeholder='Data'
                />
                <Input
                  type='time'
                  value={tensaoForm.hora}
                  onChange={(e) =>
                    setTensaoForm((f) => ({ ...f, hora: e.target.value }))
                  }
                  placeholder='Hora'
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  value={tensaoForm.tensaoDiastolica}
                  onChange={(e) =>
                    setTensaoForm((f) => ({
                      ...f,
                      tensaoDiastolica: e.target.value,
                    }))
                  }
                  placeholder='Tensão Diastólica'
                />
                <Input
                  type='number'
                  value={tensaoForm.tensaoSistolica}
                  onChange={(e) =>
                    setTensaoForm((f) => ({
                      ...f,
                      tensaoSistolica: e.target.value,
                    }))
                  }
                  placeholder='Tensão Sistólica'
                />
              </div>
              <Textarea
                placeholder='Observações'
                value={tensaoForm.observacoes}
                onChange={(e) =>
                  setTensaoForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            {utenteNome && (
              <div className='mb-4 text-sm font-semibold text-teal-700 text-center uppercase'>
                Utente: {utenteNome}
              </div>
            )}
            <ChartContainer
              config={{
                tensaoSistolica: { label: 'Tensão Máxima', color: 'hsl(142.1 76.2% 36.3%)' },
                tensaoDiastolica: { label: 'Tensão Mínima', color: 'hsl(222.2 84% 56.5%)' },
              }}
              className='min-h-[220px] w-full -mt-6'
            >
              <LineChart data={tensaoChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type='monotone'
                  dataKey='tensaoSistolica'
                  name='Tensão Máxima'
                  stroke='var(--color-tensaoSistolica)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='tensaoDiastolica'
                  name='Tensão Mínima'
                  stroke='var(--color-tensaoDiastolica)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='glicemia' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <h3 className='mb-2 text-base font-semibold text-teal-700'>Glicemia Capilar</h3>
        <div className='mb-2 flex items-center gap-2'>
          <Button
            size='sm'
            className='gap-1 bg-teal-600 hover:bg-teal-700'
            onClick={handleInsertGlicemia}
          >
            <Plus className='h-4 w-4' /> Inserir
          </Button>
          <Button
            size='sm'
            variant='destructive'
            className='gap-1'
            onClick={async () => {
              if (!utenteId) {
                toast.error('Nenhum utente selecionado.')
                return
              }
              if (selectedGlicemiaIds.length === 0) {
                toast.error('Selecione pelo menos um registo para remover.')
                return
              }
              try {
                await deleteGlicemia.mutateAsync(selectedGlicemiaIds)
                toast.success('Registo(s) removido(s) com sucesso.')
                setSelectedGlicemiaIds([])
              } catch {
                toast.error('Erro ao remover registos de glicemia.')
              }
            }}
            disabled={selectedGlicemiaIds.length === 0}
          >
            <X className='h-4 w-4' /> Remover
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]'>
          <div className='space-y-2'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        glicemias.length > 0 &&
                        selectedGlicemiaIds.length === glicemias.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedGlicemiaIds(glicemias.map((g) => g.id))
                        } else {
                          setSelectedGlicemiaIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Glicemia (mg/dL)</TableHead>
                  <TableHead>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glicemias.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGlicemiaIds.includes(row.id)}
                        onCheckedChange={(checked) =>
                          setSelectedGlicemiaIds((prev) =>
                            checked ? [...prev, row.id] : prev.filter((x) => x !== row.id)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDateForDisplay(row.data)}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>{row.glicemia}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditingGlicemia(row)
                          setGlicemiaForm({
                            data: row.data,
                            hora: row.hora,
                            glicemia: String(row.glicemia),
                            observacoes: '',
                          })
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {glicemias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center text-muted-foreground'>
                      Nenhum registo de glicemia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className='mt-2 space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  value={glicemiaForm.data}
                  onChange={(e) =>
                    setGlicemiaForm((f) => ({ ...f, data: e.target.value }))
                  }
                  placeholder='Data'
                />
                <Input
                  type='time'
                  value={glicemiaForm.hora}
                  onChange={(e) =>
                    setGlicemiaForm((f) => ({ ...f, hora: e.target.value }))
                  }
                  placeholder='Hora'
                />
              </div>
              <Input
                type='number'
                value={glicemiaForm.glicemia}
                onChange={(e) =>
                  setGlicemiaForm((f) => ({ ...f, glicemia: e.target.value }))
                }
                placeholder='Glicemia (mg/dL)'
              />
              <Textarea
                placeholder='Observações'
                value={glicemiaForm.observacoes}
                onChange={(e) =>
                  setGlicemiaForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            {utenteNome && (
              <div className='mb-4 text-sm font-semibold text-teal-700 text-center uppercase'>
                Utente: {utenteNome}
              </div>
            )}
            <ChartContainer
              config={{
                glicemia: { label: 'Glicemia (mg/dL)', color: 'hsl(171 77% 50%)' },
              }}
              className='min-h-[220px] w-full -mt-6'
            >
              <LineChart data={glicemiaChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type='monotone'
                  dataKey='glicemia'
                  name='Glicemia (mg/dL)'
                  stroke='var(--color-glicemia)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='temperatura' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <h3 className='mb-2 text-base font-semibold text-teal-700'>Temperatura Corporal</h3>
        <div className='mb-2 flex items-center gap-2'>
          <Button
            size='sm'
            className='gap-1 bg-teal-600 hover:bg-teal-700'
            onClick={handleInsertTemperatura}
          >
            <Plus className='h-4 w-4' /> Inserir
          </Button>
          <Button
            size='sm'
            variant='destructive'
            className='gap-1'
            onClick={async () => {
              if (!utenteId) {
                toast.error('Nenhum utente selecionado.')
                return
              }
              if (selectedTemperaturaIds.length === 0) {
                toast.error('Selecione pelo menos um registo para remover.')
                return
              }
              try {
                await deleteTemperatura.mutateAsync(selectedTemperaturaIds)
                toast.success('Registo(s) removido(s) com sucesso.')
                setSelectedTemperaturaIds([])
              } catch {
                toast.error('Erro ao remover registos de temperatura.')
              }
            }}
            disabled={selectedTemperaturaIds.length === 0}
          >
            <X className='h-4 w-4' /> Remover
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]'>
          <div className='space-y-2'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={
                        temperaturas.length > 0 &&
                        selectedTemperaturaIds.length === temperaturas.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemperaturaIds(temperaturas.map((t) => t.id))
                        } else {
                          setSelectedTemperaturaIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Temperatura (°C)</TableHead>
                  <TableHead>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {temperaturas.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTemperaturaIds.includes(row.id)}
                        onCheckedChange={(checked) =>
                          setSelectedTemperaturaIds((prev) =>
                            checked ? [...prev, row.id] : prev.filter((x) => x !== row.id)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDateForDisplay(row.data)}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>{row.temperatura}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditingTemperatura(row)
                          setTemperaturaForm({
                            data: row.data,
                            hora: row.hora,
                            temperatura: String(row.temperatura),
                            observacoes: '',
                          })
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {temperaturas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center text-muted-foreground'>
                      Nenhum registo de temperatura corporal.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className='mt-2 space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  value={temperaturaForm.data}
                  onChange={(e) =>
                    setTemperaturaForm((f) => ({ ...f, data: e.target.value }))
                  }
                  placeholder='Data'
                />
                <Input
                  type='time'
                  value={temperaturaForm.hora}
                  onChange={(e) =>
                    setTemperaturaForm((f) => ({ ...f, hora: e.target.value }))
                  }
                  placeholder='Hora'
                />
              </div>
              <Input
                type='number'
                value={temperaturaForm.temperatura}
                onChange={(e) =>
                  setTemperaturaForm((f) => ({ ...f, temperatura: e.target.value }))
                }
                placeholder='Temperatura (°C)'
              />
              <Textarea
                placeholder='Observações'
                value={temperaturaForm.observacoes}
                onChange={(e) =>
                  setTemperaturaForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            {utenteNome && (
              <div className='mb-4 text-sm font-semibold text-teal-700 text-center uppercase'>
                Utente: {utenteNome}
              </div>
            )}
            <ChartContainer
              config={{
                temperatura: { label: 'Temperatura (°C)', color: 'hsl(27.9 96.5% 61.8%)' },
              }}
              className='min-h-[220px] w-full -mt-6'
            >
              <LineChart data={temperaturaChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type='monotone'
                  dataKey='temperatura'
                  name='Temperatura (°C)'
                  stroke='var(--color-temperatura)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='imc' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <h3 className='mb-2 text-base font-semibold text-teal-700'>IMC (Índice Massa Corporal)</h3>
        <div className='mb-2 flex items-center gap-2'>
          <Button
            size='sm'
            className='gap-1 bg-teal-600 hover:bg-teal-700'
            onClick={handleInsertImc}
          >
            <Plus className='h-4 w-4' /> Inserir
          </Button>
          <Button
            size='sm'
            variant='destructive'
            className='gap-1'
            onClick={async () => {
              if (!utenteId) {
                toast.error('Nenhum utente selecionado.')
                return
              }
              if (selectedImcIds.length === 0) {
                toast.error('Selecione pelo menos um registo para remover.')
                return
              }
              try {
                await deleteImc.mutateAsync(selectedImcIds)
                toast.success('Registo(s) removido(s) com sucesso.')
                setSelectedImcIds([])
              } catch {
                toast.error('Erro ao remover registos de IMC.')
              }
            }}
            disabled={selectedImcIds.length === 0}
          >
            <X className='h-4 w-4' /> Remover
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]'>
          <div className='space-y-2'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={imcs.length > 0 && selectedImcIds.length === imcs.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedImcIds(imcs.map((i) => i.id))
                        } else {
                          setSelectedImcIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Altura (m)</TableHead>
                  <TableHead>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imcs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedImcIds.includes(row.id)}
                        onCheckedChange={(checked) =>
                          setSelectedImcIds((prev) =>
                            checked ? [...prev, row.id] : prev.filter((x) => x !== row.id)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDateForDisplay(row.data)}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>{row.peso}</TableCell>
                    <TableCell>{row.altura}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditingImc(row)
                          setImcForm({
                            data: row.data,
                            hora: row.hora,
                            peso: String(row.peso),
                            altura: String(row.altura),
                            observacoes: '',
                          })
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {imcs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center text-muted-foreground'>
                      Nenhum registo de IMC.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className='mt-2 space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  value={imcForm.data}
                  onChange={(e) =>
                    setImcForm((f) => ({ ...f, data: e.target.value }))
                  }
                  placeholder='Data'
                />
                <Input
                  type='time'
                  value={imcForm.hora}
                  onChange={(e) =>
                    setImcForm((f) => ({ ...f, hora: e.target.value }))
                  }
                  placeholder='Hora'
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  value={imcForm.peso}
                  onChange={(e) =>
                    setImcForm((f) => ({ ...f, peso: e.target.value }))
                  }
                  placeholder='Peso (kg)'
                />
                <Input
                  type='number'
                  value={imcForm.altura}
                  onChange={(e) =>
                    setImcForm((f) => ({ ...f, altura: e.target.value }))
                  }
                  placeholder='Altura (m)'
                />
              </div>
              <Textarea
                placeholder='Observações'
                value={imcForm.observacoes}
                onChange={(e) =>
                  setImcForm((f) => ({ ...f, observacoes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            {utenteNome && (
              <div className='mb-4 text-sm font-semibold text-teal-700 text-center uppercase'>
                Utente: {utenteNome}
              </div>
            )}
            <ChartContainer
              config={{
                imc: { label: 'IMC', color: 'hsl(222.2 84% 56.5%)' },
                peso: { label: 'Peso (kg)', color: 'hsl(142.1 76.2% 36.3%)' },
                altura: { label: 'Altura (m)', color: 'hsl(27.9 96.5% 61.8%)' },
              }}
              className='min-h-[220px] w-full -mt-6'
            >
              <LineChart data={imcChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type='monotone'
                  dataKey='imc'
                  name='IMC'
                  stroke='var(--color-imc)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='peso'
                  name='Peso (kg)'
                  stroke='var(--color-peso)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='altura'
                  name='Altura (m)'
                  stroke='var(--color-altura)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='gordura' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <GorduraMassaMuscularForm
          utenteId={utenteId}
          records={gorduraRecords}
          createMutation={createGordura}
          updateMutation={updateGordura}
          deleteMutation={deleteGordura}
          formatHoraForApi={formatHoraForApi}
        />
      </TabsContent>

      <TabsContent value='antropometrica' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <AvaliacaoAntropometricaForm
          utenteId={utenteId}
          records={antropometricaRecords}
          createMutation={createAntropometrica}
          updateMutation={updateAntropometrica}
          deleteMutation={deleteAntropometrica}
          formatHoraForApi={formatHoraForApi}
        />
      </TabsContent>

      <TabsContent value='postural' className='mt-0 rounded-lg border bg-card p-4 text-sm'>
        <AvaliacaoPosturalForm
          utenteId={utenteId}
          records={posturalRecords}
          createMutation={createPostural}
          updateMutation={updatePostural}
          deleteMutation={deletePostural}
          formatHoraForApi={formatHoraForApi}
        />
      </TabsContent>
    </Tabs>
  )
}


const GORDURA_FIELDS_LEFT = [
  { key: 'percentAguaCorpo', label: '% Água no Corpo' },
  { key: 'percentGordPernaDir', label: '% Gordura Perna Direita' },
  { key: 'percentGordPernaEsq', label: '% Gordura Perna Esquerda' },
  { key: 'percentGordBracoDir', label: '% Gordura Braço Direito' },
  { key: 'percentGordBracoEsq', label: '% Gordura Braço Esquerdo' },
  { key: 'percentGordTronco', label: '% Gordura Tronco' },
  { key: 'gorduraVisceral', label: 'Gordura Visceral' },
] as const

const GORDURA_FIELDS_RIGHT = [
  { key: 'massaMuscPernaDir', label: 'Kg Massa Muscular Perna Direita' },
  { key: 'massaMuscPernaEsq', label: 'Kg Massa Muscular Perna Esquerda' },
  { key: 'massaMuscBracoDir', label: 'Kg MassaMuscular Braço Direito' },
  { key: 'massaMuscBracoEsq', label: 'Kg MassaMuscular Braço Esquerdo' },
  { key: 'massaMuscTronco', label: 'Kg Massa Muscular Tronco' },
  { key: 'consumoMetabolico', label: 'Kcal Consumo Metabolico' },
] as const

function GorduraMassaMuscularForm({
  utenteId,
  records,
  createMutation,
  updateMutation,
  deleteMutation,
  formatHoraForApi,
}: {
  utenteId: string
  records: GorduraMassaMuscularTableDTO[]
  createMutation: ReturnType<typeof useCreateGorduraMassaMuscular>
  updateMutation: ReturnType<typeof useUpdateGorduraMassaMuscular>
  deleteMutation: ReturnType<typeof useDeleteGorduraMassaMuscular>
  formatHoraForApi: (h: string) => string
}) {
  const allKeys = [...GORDURA_FIELDS_LEFT, ...GORDURA_FIELDS_RIGHT].map((f) => f.key)

  const buildFromRecord = (rec: GorduraMassaMuscularTableDTO | null) => {
    const obj: Record<string, string> = {}
    allKeys.forEach((k) => {
      obj[k] = rec ? String(rec[k as keyof GorduraMassaMuscularTableDTO] ?? '') : ''
    })
    return obj
  }

  const [editing, setEditing] = useState<GorduraMassaMuscularTableDTO | null>(null)
  const [form, setForm] = useState<Record<string, string>>(() => buildFromRecord(null))

  const handleSave = async () => {
    if (!utenteId) { toast.error('Nenhum utente selecionado.'); return }
    const now = new Date()
    const data = now.toISOString().slice(0, 10)
    const hora = formatHoraForApi(now.toTimeString().slice(0, 5))

    const payload: Record<string, any> = { data, hora }
    allKeys.forEach((k) => {
      const v = form[k]
      payload[k] = v ? Number(v) : null
    })

    try {
      if (editing) {
        const res = await updateMutation.mutateAsync({
          id: editing.id,
          data: { id: editing.id, utenteId, ...payload } as any,
        })
        if (res?.info?.status !== 0 && res?.info?.status !== undefined) {
          const msgs = res?.info?.messages ?? {}
          const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar.'
          toast.error(String(firstMsg))
          return
        }
        toast.success('Gordura / Massa Muscular atualizada.')
      } else {
        await createMutation.mutateAsync({ utenteId, ...payload } as any)
        toast.success('Gordura / Massa Muscular guardada.')
      }
      setEditing(null)
      setForm(buildFromRecord(null))
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao guardar.')
    }
  }

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div>
      <div className='mb-3 flex justify-end'>
        <Button size='sm' className='gap-1' onClick={handleSave}>
          Guardar Gordura / Massa Muscular
        </Button>
      </div>
      <h3 className='mb-2 text-base font-semibold text-teal-700'>Gordura / Massa Muscular</h3>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div>
          <h4 className='mb-3 font-semibold'>% Gordura Corporal</h4>
          <div className='space-y-3'>
            {GORDURA_FIELDS_LEFT.map(({ key, label }) => (
              <div key={key}>
                <label className='mb-1 block text-xs text-muted-foreground'>{label}</label>
                <Input
                  type='number'
                  step='0.01'
                  value={form[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                  className='max-w-[250px]'
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className='mb-3 font-semibold'>Kg Massa Muscular Total</h4>
          <div className='space-y-3'>
            {GORDURA_FIELDS_RIGHT.map(({ key, label }) => (
              <div key={key}>
                <label className='mb-1 block text-xs text-muted-foreground'>{label}</label>
                <Input
                  type='number'
                  step='0.01'
                  value={form[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                  className='max-w-[250px]'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {records.length > 0 && (
        <div className='mt-6'>
          <h4 className='mb-2 text-sm font-semibold text-teal-700'>
            Registos anteriores
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Data</TableHead>
                <TableHead className='text-center'>Hora</TableHead>
                <TableHead className='text-center'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='text-center'>
                    {formatDateForDisplay(r.data)}
                  </TableCell>
                  <TableCell className='text-center'>{r.hora}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditing(r)
                          setForm(buildFromRecord(r))
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive'
                        onClick={async () => {
                          try {
                            await deleteMutation.mutateAsync([r.id])
                            toast.success('Registo removido com sucesso.')
                            if (editing?.id === r.id) {
                              setEditing(null)
                              setForm(buildFromRecord(null))
                            }
                          } catch {
                            toast.error('Erro ao remover registo.')
                          }
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

const ANTROPOMETRICA_MUSCLES = [
  { name: 'Quadricep', prefix: 'quadricep' },
  { name: 'Isquiotibial', prefix: 'isquiotibial' },
  { name: 'Adutor', prefix: 'adutor' },
  { name: 'Abdutor', prefix: 'abdutor' },
  { name: 'Gluteo', prefix: 'gluteo' },
  { name: 'Gêmeo', prefix: 'gemeo' },
  { name: 'Abdutor Ombro', prefix: 'abdutorOmbro' },
  { name: 'Flexor Ombro', prefix: 'flexorOmbro' },
  { name: 'Extensor Ombro', prefix: 'extensorOmbro' },
  { name: 'Rotador Interno Ombro', prefix: 'rotadorInternoOmbro' },
  { name: 'Rotador Externo Ombro', prefix: 'rotadorExternoOmbro' },
] as const

function AvaliacaoAntropometricaForm({
  utenteId,
  records,
  createMutation,
  updateMutation,
  deleteMutation,
  formatHoraForApi,
}: {
  utenteId: string
  records: AvaliacaoAntropometricaTableDTO[]
  createMutation: ReturnType<typeof useCreateAvaliacaoAntropometrica>
  updateMutation: ReturnType<typeof useUpdateAvaliacaoAntropometrica>
  deleteMutation: ReturnType<typeof useDeleteAvaliacaoAntropometrica>
  formatHoraForApi: (h: string) => string
}) {
  const buildFromRecord = (rec: AvaliacaoAntropometricaTableDTO | null) => {
    const obj: Record<string, string> = {}
    ANTROPOMETRICA_MUSCLES.forEach(({ prefix }) => {
      ;['Esq', 'Dir', 'Dif'].forEach((suffix) => {
        const key = `${prefix}${suffix}`
        obj[key] = rec ? String((rec as any)[key] ?? '') : ''
      })
    })
    return obj
  }

  const [editing, setEditing] = useState<AvaliacaoAntropometricaTableDTO | null>(null)
  const [form, setForm] = useState<Record<string, string>>(() => buildFromRecord(null))

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!utenteId) { toast.error('Nenhum utente selecionado.'); return }
    const now = new Date()
    const data = now.toISOString().slice(0, 10)
    const hora = formatHoraForApi(now.toTimeString().slice(0, 5))

    const payload: Record<string, any> = { data, hora }
    ANTROPOMETRICA_MUSCLES.forEach(({ prefix }) => {
      ;['Esq', 'Dir', 'Dif'].forEach((suffix) => {
        const key = `${prefix}${suffix}`
        const v = form[key]
        payload[key] = v ? Number(v) : null
      })
    })

    try {
      if (editing) {
        const res = await updateMutation.mutateAsync({
          id: editing.id,
          data: { id: editing.id, utenteId, ...payload } as any,
        })
        if (res?.info?.status !== 0 && res?.info?.status !== undefined) {
          const msgs = res?.info?.messages ?? {}
          const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar.'
          toast.error(String(firstMsg))
          return
        }
        toast.success('Avaliação Antropométrica atualizada.')
      } else {
        await createMutation.mutateAsync({ utenteId, ...payload } as any)
        toast.success('Avaliação Antropométrica guardada.')
      }
      setEditing(null)
      setForm(buildFromRecord(null))
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao guardar.')
    }
  }

  return (
    <div>
      <div className='mb-3 flex justify-end'>
        <Button size='sm' className='gap-1' onClick={handleSave}>
          Guardar Avaliação Antropométrica
        </Button>
      </div>
      <h3 className='mb-2 text-base font-semibold text-teal-700'>Avaliação Antropometrica</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='font-bold'>Musculo</TableHead>
            <TableHead className='font-bold text-center'>Esq(Kg)</TableHead>
            <TableHead className='font-bold text-center'>Dir(Kg)</TableHead>
            <TableHead className='font-bold text-center'>Diferença(%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ANTROPOMETRICA_MUSCLES.map(({ name, prefix }) => (
            <TableRow key={prefix}>
              <TableCell className='font-medium'>{name}</TableCell>
              <TableCell>
                <Input
                  type='number'
                  step='0.01'
                  className='mx-auto w-full max-w-[140px]'
                  value={form[`${prefix}Esq`] ?? ''}
                  onChange={(e) => setField(`${prefix}Esq`, e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  step='0.01'
                  className='mx-auto w-full max-w-[140px]'
                  value={form[`${prefix}Dir`] ?? ''}
                  onChange={(e) => setField(`${prefix}Dir`, e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  step='0.01'
                  className='mx-auto w-full max-w-[140px]'
                  value={form[`${prefix}Dif`] ?? ''}
                  onChange={(e) => setField(`${prefix}Dif`, e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {records.length > 0 && (
        <div className='mt-6'>
          <h4 className='mb-2 text-sm font-semibold text-teal-700'>
            Registos anteriores
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Data</TableHead>
                <TableHead className='text-center'>Hora</TableHead>
                <TableHead className='text-center'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='text-center'>
                    {formatDateForDisplay(r.data)}
                  </TableCell>
                  <TableCell className='text-center'>{r.hora}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditing(r)
                          setForm(buildFromRecord(r))
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive'
                        onClick={async () => {
                          try {
                            await deleteMutation.mutateAsync([r.id])
                            toast.success('Registo removido com sucesso.')
                            if (editing?.id === r.id) {
                              setEditing(null)
                              setForm(buildFromRecord(null))
                            }
                          } catch {
                            toast.error('Erro ao remover registo.')
                          }
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
const POSTURAL_SECTIONS = [
  {
    category: 'Olho',
    items: [
      { key: 'endoforia', label: 'Endoforia' },
      { key: 'exoforia', label: 'Exoforia' },
      { key: 'hiperforia', label: 'Hipertoria' },
    ],
  },
  {
    category: 'ATM',
    items: [
      { key: 'desvio', label: 'Desvio' },
      { key: 'abertura', label: 'Abertura' },
      { key: 'fecho', label: 'Fecho' },
    ],
  },
  {
    category: 'Pé',
    items: [
      { key: 'supinado', label: 'Supinado' },
      { key: 'pronado', label: 'Pronado' },
      { key: 'neutro', label: 'Neutro' },
    ],
  },
  {
    category: 'Coluna',
    items: [
      { key: 'escoliose', label: 'Escoliose' },
      { key: 'hipercifose', label: 'Hipercifose' },
      { key: 'hiperlordose', label: 'Hiperlordose' },
    ],
  },
  {
    category: 'Perna',
    items: [
      { key: 'curta', label: 'Curta' },
      { key: 'valgo', label: 'Valgo' },
      { key: 'varo', label: 'Varo' },
    ],
  },
  {
    category: 'Anca/Bacia',
    items: [
      { key: 'iliaco', label: 'Ilíaco' },
      { key: 'sacro', label: 'Sacro' },
    ],
  },
  {
    category: 'Ombro',
    items: [
      { key: 'subido', label: 'Subido' },
      { key: 'descido', label: 'Descido' },
      { key: 'anterior', label: 'Anterior' },
      { key: 'posterior', label: 'Posterior' },
    ],
  },
  {
    category: 'Cabeça',
    items: [
      { key: 'rotacao', label: 'Rotação' },
      { key: 'inclinacao', label: 'Inclinação' },
    ],
  },
  {
    category: 'Outros',
    items: [
      { key: 'outros1', label: '' },
      { key: 'outros2', label: '' },
      { key: 'outros3', label: '' },
    ],
  },
]

function AvaliacaoPosturalForm({
  utenteId,
  records,
  createMutation,
  updateMutation,
  deleteMutation,
  formatHoraForApi,
}: {
  utenteId: string
  records: AvaliacaoPosturalTableDTO[]
  createMutation: ReturnType<typeof useCreateAvaliacaoPostural>
  updateMutation: ReturnType<typeof useUpdateAvaliacaoPostural>
  deleteMutation: ReturnType<typeof useDeleteAvaliacaoPostural>
  formatHoraForApi: (h: string) => string
}) {
  const allKeys: string[] = []
  POSTURAL_SECTIONS.forEach((s) =>
    s.items.forEach((i) => {
      allKeys.push(`${i.key}Presente`)
      allKeys.push(`${i.key}Valores`)
    })
  )

  const buildFromRecord = (rec: AvaliacaoPosturalTableDTO | null) => {
    const obj: Record<string, string> = {}
    allKeys.forEach((k) => {
      obj[k] = rec ? String((rec as any)[k] ?? '') : ''
    })
    return obj
  }

  const [editing, setEditing] = useState<AvaliacaoPosturalTableDTO | null>(null)
  const [form, setForm] = useState<Record<string, string>>(() => buildFromRecord(null))

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!utenteId) { toast.error('Nenhum utente selecionado.'); return }
    const now = new Date()
    const data = now.toISOString().slice(0, 10)
    const hora = formatHoraForApi(now.toTimeString().slice(0, 5))

    const payload: Record<string, any> = { data, hora }
    allKeys.forEach((k) => {
      payload[k] = form[k] || null
    })

    try {
      if (editing) {
        const res = await updateMutation.mutateAsync({
          id: editing.id,
          data: { id: editing.id, utenteId, ...payload } as any,
        })
        if (res?.info?.status !== 0 && res?.info?.status !== undefined) {
          const msgs = res?.info?.messages ?? {}
          const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar.'
          toast.error(String(firstMsg))
          return
        }
        toast.success('Avaliação Postural atualizada.')
      } else {
        await createMutation.mutateAsync({ utenteId, ...payload } as any)
        toast.success('Avaliação Postural guardada.')
      }
      setEditing(null)
      setForm(buildFromRecord(null))
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao guardar.')
    }
  }

  return (
    <div>
      <div className='mb-3 flex justify-end'>
        <Button size='sm' className='gap-1' onClick={handleSave}>
          Guardar Avaliação Postural
        </Button>
      </div>
      <h3 className='mb-2 text-base font-semibold text-teal-700'>Avaliação Postural</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2} className='font-bold text-center'>Avaliação</TableHead>
            <TableHead className='font-bold text-center'>Presente</TableHead>
            <TableHead className='font-bold text-center'>Valores/Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {POSTURAL_SECTIONS.map((section) =>
            section.items.map((item, idx) => (
              <TableRow key={item.key}>
                {idx === 0 && (
                  <TableCell
                    rowSpan={section.items.length}
                    className='font-medium align-top whitespace-nowrap border-r'
                  >
                    {section.category}
                  </TableCell>
                )}
                <TableCell className='whitespace-nowrap'>
                  {item.label || `Outro ${item.key.replace('outros', '')}`}
                </TableCell>
                <TableCell>
                  <Input
                    className='mx-auto w-full max-w-[160px]'
                    value={form[`${item.key}Presente`] ?? ''}
                    onChange={(e) => setField(`${item.key}Presente`, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className='mx-auto w-full max-w-[220px]'
                    value={form[`${item.key}Valores`] ?? ''}
                    onChange={(e) => setField(`${item.key}Valores`, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {records.length > 0 && (
        <div className='mt-6'>
          <h4 className='mb-2 text-sm font-semibold text-teal-700'>
            Registos anteriores
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Data</TableHead>
                <TableHead className='text-center'>Hora</TableHead>
                <TableHead className='text-center'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='text-center'>
                    {formatDateForDisplay(r.data)}
                  </TableCell>
                  <TableCell className='text-center'>{r.hora}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setEditing(r)
                          setForm(buildFromRecord(r))
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive'
                        onClick={async () => {
                          try {
                            await deleteMutation.mutateAsync([r.id])
                            toast.success('Registo removido com sucesso.')
                            if (editing?.id === r.id) {
                              setEditing(null)
                              setForm(buildFromRecord(null))
                            }
                          } catch {
                            toast.error('Erro ao remover registo.')
                          }
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


