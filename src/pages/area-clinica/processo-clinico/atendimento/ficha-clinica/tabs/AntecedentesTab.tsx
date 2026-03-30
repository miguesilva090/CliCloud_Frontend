import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Save, Plus, X, ChevronDown, UtensilsCrossed, Heart, Search } from 'lucide-react'
import { AlergiasUtenteModal } from '../modals/AlergiasUtenteModal'
import { AntecedentesPessoaisModal } from '../modals/AntecedentesPessoaisModal'
import { AntecedentesCirurgicosModal } from '../modals/AntecedentesCirurgicosModal'
import { AntecedentesFamiliaresUtenteModal } from '../modals/AntecedentesFamiliaresUtenteModal'
import { QuestionarioTab } from './QuestionarioTab'
import { useGetHabitosEViciosByUtente, useSaveHabitosEVicios } from '../queries/habitos-evicios-queries'
import { useGetAlergiasUtentePaginated, useInvalidateAlergiasUtente } from '../queries/alergias-utente-queries'
import {
  useGetAntecedentesPessoaisPaginated,
  useInvalidateAntecedentesPessoais,
} from '../queries/antecedentes-pessoais-queries'
import {
  useGetAntecedentesCirurgicosPaginated,
  useInvalidateAntecedentesCirurgicos,
} from '../queries/antecedentes-cirurgicos-queries'
import {
  useGetAntecedentesFamiliaresUtentePaginated,
  useInvalidateAntecedentesFamiliaresUtente,
} from '../queries/antecedentes-familiares-utente-queries'
import { format } from 'date-fns'
import { AntecedentesPessoaisService } from '@/lib/services/antecedentes/antecedentes-pessoais-service'
import { AntecedentesCirurgicosService } from '@/lib/services/antecedentes/antecedentes-cirurgicos-service'
import { AntecedentesFamiliaresUtenteService } from '@/lib/services/antecedentes/antecedentes-familiares-utente-service'
import { AlergiaUtenteService } from '@/lib/services/alergias/alergia-utente-service'
import { toast } from '@/utils/toast-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import type { AlergiaUtenteDTO } from '@/types/dtos/alergias/alergia-utente.dtos'
import type { AntecedentesCirurgicosTableDTO } from '@/types/dtos/saude/antecedentes-cirurgicos.dtos'
import type { AntecedentesPessoaisTableDTO } from '@/types/dtos/saude/antecedentes-pessoais.dtos'
import type { AntecedentesFamiliaresUtenteTableDTO } from '@/types/dtos/saude/antecedentes-familiares-utente.dtos'

export interface AntecedentesTabProps {
  utenteId?: string
}

export function AntecedentesTab({ utenteId = '' }: AntecedentesTabProps) {
  const [cuidadosSaude, setCuidadosSaude] = useState<'sim' | 'nao'>('nao')
  const [continuados, setContinuados] = useState(false)
  const [esporadicos, setEsporadicos] = useState(false)
  const [alergiasModalOpen, setAlergiasModalOpen] = useState(false)
  const [editingAlergiaUtente, setEditingAlergiaUtente] = useState<AlergiaUtenteDTO | null>(null)
  const [pessoaisModalOpen, setPessoaisModalOpen] = useState(false)
  const [editingPessoal, setEditingPessoal] = useState<AntecedentesPessoaisTableDTO | null>(null)
  const [cirurgicoModalOpen, setCirurgicoModalOpen] = useState(false)
  const [editingCirurgico, setEditingCirurgico] = useState<AntecedentesCirurgicosTableDTO | null>(
    null
  )
  const [selectedCirurgico, setSelectedCirurgico] =
    useState<AntecedentesCirurgicosTableDTO | null>(null)
  const [familiaresModalOpen, setFamiliaresModalOpen] = useState(false)
  const [editingFamiliar, setEditingFamiliar] =
    useState<AntecedentesFamiliaresUtenteTableDTO | null>(null)
  const [selectedPessoaisIds, setSelectedPessoaisIds] = useState<string[]>([])
  const [selectedFamiliaresIds, setSelectedFamiliaresIds] = useState<string[]>([])
  const [deletePessoaisDialogOpen, setDeletePessoaisDialogOpen] = useState(false)
  const [deleteCirurgicoDialogOpen, setDeleteCirurgicoDialogOpen] = useState(false)
  const [deleteFamiliaresDialogOpen, setDeleteFamiliaresDialogOpen] = useState(false)
  const [selectedAlergiaIds, setSelectedAlergiaIds] = useState<string[]>([])
  const [deleteAlergiasDialogOpen, setDeleteAlergiasDialogOpen] = useState(false)
  const [isDeletingAlergias, setIsDeletingAlergias] = useState(false)
  const [isDeletingPessoais, setIsDeletingPessoais] = useState(false)
  const [isDeletingCirurgico, setIsDeletingCirurgico] = useState(false)
  const [isDeletingFamiliares, setIsDeletingFamiliares] = useState(false)
  const permitirCheckboxes = cuidadosSaude === 'sim'

  const [activeHabitosSection, setActiveHabitosSection] = useState<'alimentares' | 'medicamentos'>('alimentares')

  const { data: habitosEVicios } = useGetHabitosEViciosByUtente(utenteId)
  const saveHabitosMutation = useSaveHabitosEVicios(utenteId)

  const habitosFormRef = useRef<HTMLFormElement | null>(null)

  const [consumoDeFrutasChecked, setConsumoDeFrutasChecked] = useState(false)
  const [consumoAguaChecked, setConsumoAguaChecked] = useState(false)
  const [consumoPeixeChecked, setConsumoPeixeChecked] = useState(false)
  const [consumoVegetaisChecked, setConsumoVegetaisChecked] = useState(false)
  const [ingestaoLeiteChecked, setIngestaoLeiteChecked] = useState(false)
  const [consumoSalgadosChecked, setConsumoSalgadosChecked] = useState(false)
  const [consumoAcucaradosChecked, setConsumoAcucaradosChecked] = useState(false)
  const [consumoBebidasAlcoolicasChecked, setConsumoBebidasAlcoolicasChecked] =
    useState(false)
  const [fumaChecked, setFumaChecked] = useState(false)
  const [consumoDrogasChecked, setConsumoDrogasChecked] = useState(false)
  const [consumoCarneChecked, setConsumoCarneChecked] = useState(false)
  const [tipoCarne, setTipoCarne] = useState<'brancas' | 'vermelhas' | ''>('')
  const [tomaFarmacosPrescritosChecked, setTomaFarmacosPrescritosChecked] = useState(false)
  const [tomaFarmacosSemReceita, setTomaFarmacosSemReceita] = useState<'sim' | 'nao' | ''>('')
  const [praticaExercicioFisicoChecked, setPraticaExercicioFisicoChecked] = useState(false)

  useEffect(() => {
    setConsumoDeFrutasChecked(habitosEVicios?.consumoDeFrutas ?? false)
    setConsumoAguaChecked(habitosEVicios?.consumoAgua ?? false)
    setConsumoPeixeChecked(habitosEVicios?.consumoPeixe ?? false)
    setConsumoVegetaisChecked(habitosEVicios?.consumoVegetais ?? false)
    setIngestaoLeiteChecked(habitosEVicios?.ingestaoLeite ?? false)
    setConsumoSalgadosChecked(habitosEVicios?.consumoSalgados ?? false)
    setConsumoAcucaradosChecked(habitosEVicios?.consumoAcucarados ?? false)
    setConsumoBebidasAlcoolicasChecked(habitosEVicios?.consumoBebidasAlcoolicas ?? false)
    setFumaChecked(habitosEVicios?.fuma ?? false)
    setConsumoDrogasChecked(habitosEVicios?.consumoDrogas ?? false)
    setConsumoCarneChecked(habitosEVicios?.consumoCarne ?? false)

    setTomaFarmacosPrescritosChecked(habitosEVicios?.tomaFarmacosPrescritos ?? false)
    if (habitosEVicios?.tomaFarmacosSemReceita === true) {
      setTomaFarmacosSemReceita('sim')
    } else if (habitosEVicios?.tomaFarmacosSemReceita === false) {
      setTomaFarmacosSemReceita('nao')
    } else {
      setTomaFarmacosSemReceita('')
    }
    setPraticaExercicioFisicoChecked(habitosEVicios?.praticaExercicioFisico ?? false)
    if (habitosEVicios?.tipoCarne === 1) {
      setTipoCarne('brancas')
    } else if (habitosEVicios?.tipoCarne === 2) {
      setTipoCarne('vermelhas')
    } else {
      setTipoCarne('')
    }
  }, [habitosEVicios])

  const { data: alergiasData } = useGetAlergiasUtentePaginated(utenteId, 1, 100)
  const alergiasUtente = (alergiasData?.info?.data ?? []) as AlergiaUtenteDTO[]
  const hasAlergias = alergiasUtente.length > 0
  const { data: antecedentesPessoaisData } = useGetAntecedentesPessoaisPaginated(
    utenteId,
    1,
    100
  )
  const antecedentesPessoais = (antecedentesPessoaisData?.info?.data ??
    []) as AntecedentesPessoaisTableDTO[]
  const hasAntecedentesPessoais = antecedentesPessoais.length > 0
  const { data: antecedentesCirurgicosData } = useGetAntecedentesCirurgicosPaginated(utenteId, 1, 100)
  const antecedentesCirurgicos = (antecedentesCirurgicosData?.info?.data ??
    []) as AntecedentesCirurgicosTableDTO[]
  const hasAntecedentesCirurgicos = antecedentesCirurgicos.length > 0
  const { data: antecedentesFamiliaresData } = useGetAntecedentesFamiliaresUtentePaginated(
    utenteId,
    1,
    100
  )
  const antecedentesFamiliares = (antecedentesFamiliaresData?.info?.data ??
    []) as AntecedentesFamiliaresUtenteTableDTO[]
  const hasAntecedentesFamiliares = antecedentesFamiliares.length > 0
  const selectedCirurgicoData =
    selectedCirurgico ?? (hasAntecedentesCirurgicos ? antecedentesCirurgicos[0] : null)

  const invalidateAntecedentesPessoais = useInvalidateAntecedentesPessoais()
  const invalidateAntecedentesCirurgicos = useInvalidateAntecedentesCirurgicos()
  const invalidateAntecedentesFamiliares = useInvalidateAntecedentesFamiliaresUtente()
  const invalidateAlergiasUtente = useInvalidateAlergiasUtente()

  const handleRemoverPessoaisClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (selectedPessoaisIds.length === 0) {
      toast.error('Selecione pelo menos um antecedente pessoal para remover.')
      return
    }
    setDeletePessoaisDialogOpen(true)
  }

  const handleRemoverAlergiasClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (selectedAlergiaIds.length === 0) {
      toast.error('Selecione pelo menos uma alergia para remover.')
      return
    }
    setDeleteAlergiasDialogOpen(true)
  }

  const handleConfirmRemoverAlergias = async () => {
    if (!utenteId || selectedAlergiaIds.length === 0) return
    try {
      setIsDeletingAlergias(true)
      const client = AlergiaUtenteService()
      await Promise.all(selectedAlergiaIds.map((id) => client.deleteAlergiaUtente(id)))
      toast.success('Alergia(s) removida(s) com sucesso.')
      setSelectedAlergiaIds([])
      invalidateAlergiasUtente()
    } catch {
      toast.error('Erro ao remover alergias.')
    } finally {
      setIsDeletingAlergias(false)
      setDeleteAlergiasDialogOpen(false)
    }
  }

  const handleConfirmRemoverPessoais = async () => {
    if (!utenteId || selectedPessoaisIds.length === 0) return
    try {
      setIsDeletingPessoais(true)
      const client = AntecedentesPessoaisService()
      await Promise.all(selectedPessoaisIds.map((id) => client.delete(id)))
      toast.success('Antecedente(s) pessoal(is) removido(s) com sucesso.')
      setSelectedPessoaisIds([])
      invalidateAntecedentesPessoais()
    } catch (error) {
      toast.error('Erro ao remover antecedentes pessoais.')
    } finally {
      setIsDeletingPessoais(false)
      setDeletePessoaisDialogOpen(false)
    }
  }

  const handleRemoverCirurgicoClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (!selectedCirurgicoData?.id) {
      toast.error('Selecione um antecedente cirúrgico para remover.')
      return
    }
    setDeleteCirurgicoDialogOpen(true)
  }

  const handleConfirmRemoverCirurgico = async () => {
    if (!utenteId || !selectedCirurgicoData?.id) return
    try {
      setIsDeletingCirurgico(true)
      const client = AntecedentesCirurgicosService()
      await client.delete(selectedCirurgicoData.id)
      toast.success('Antecedente cirúrgico removido com sucesso.')
      setSelectedCirurgico(null)
      invalidateAntecedentesCirurgicos()
    } catch (error) {
      toast.error('Erro ao remover antecedente cirúrgico.')
    } finally {
      setIsDeletingCirurgico(false)
      setDeleteCirurgicoDialogOpen(false)
    }
  }

  const handleRemoverFamiliaresClick = () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    if (selectedFamiliaresIds.length === 0) {
      toast.error('Selecione pelo menos um antecedente familiar para remover.')
      return
    }
    setDeleteFamiliaresDialogOpen(true)
  }

  const handleConfirmRemoverFamiliares = async () => {
    if (!utenteId || selectedFamiliaresIds.length === 0) return
    try {
      setIsDeletingFamiliares(true)
      const client = AntecedentesFamiliaresUtenteService()
      await Promise.all(selectedFamiliaresIds.map((id) => client.delete(id)))
      toast.success('Antecedente(s) familiar(es) removido(s) com sucesso.')
      setSelectedFamiliaresIds([])
      invalidateAntecedentesFamiliares()
    } catch (error) {
      toast.error('Erro ao remover antecedentes familiares.')
    } finally {
      setIsDeletingFamiliares(false)
      setDeleteFamiliaresDialogOpen(false)
    }
  }
  return (
    <Tabs defaultValue='pessoais' className='flex flex-col gap-2'>
      <TabsList className='flex flex-wrap justify-start gap-[2px] bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='pessoais' className='tabs-pill px-2 py-1'>
          Antecedentes Pessoais
        </TabsTrigger>
        <TabsTrigger
          value='familiares'
          className='tabs-pill px-2 py-1'
        >
          Antecedentes Familiares
        </TabsTrigger>
        <TabsTrigger
          value='alergias'
          className='tabs-pill px-2 py-1'
        >
          Alergias
        </TabsTrigger>
        <TabsTrigger
          value='questionario'
          className='tabs-pill px-2 py-1'
        >
          Questionário
        </TabsTrigger>
        <TabsTrigger
          value='habitos'
          className='tabs-pill px-2 py-1'
        >
          Hábitos e Vícios
        </TabsTrigger>
      </TabsList>

      <TabsContent value='pessoais' className='mt-0 space-y-6'>
        <div className='rounded-lg border bg-card'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-teal-50 px-4 py-2 dark:bg-teal-950/30'>
            <h3 className='text-sm font-semibold text-teal-800 dark:text-teal-200'>Antecedentes</h3>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                className='gap-1 bg-teal-600 hover:bg-teal-700'
                onClick={() => {
                  setEditingPessoal(null)
                  setPessoaisModalOpen(true)
                }}
                disabled={!utenteId}
              >
                <Plus className='h-4 w-4' /> Inserir
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='gap-1'
                onClick={handleRemoverPessoaisClick}
                disabled={!utenteId || selectedPessoaisIds.length === 0 || isDeletingPessoais}
              >
                <X className='h-4 w-4' /> Remover
              </Button>
            </div>
          </div>
          <div className='flex flex-col gap-4 p-4 md:flex-row'>
            <div className='min-w-0 flex-1 overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10' />
                    <TableHead className='text-left'>Descrição</TableHead>
                    <TableHead className='text-center'>Ano</TableHead>
                    <TableHead className='text-center'>Idade</TableHead>
                    <TableHead className='text-center'>Data</TableHead>
                    <TableHead className='w-16 text-center'>Editar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasAntecedentesPessoais ? (
                    <TableRow>
                      <TableCell colSpan={6} className='py-8 text-center text-muted-foreground'>
                        Não existem dados a apresentar
                      </TableCell>
                    </TableRow>
                  ) : (
                    antecedentesPessoais.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className='w-10 align-middle'>
                          <Checkbox
                            checked={selectedPessoaisIds.includes(row.id)}
                            onCheckedChange={(c) => {
                              if (c === true) {
                                setSelectedPessoaisIds((prev) =>
                                  prev.includes(row.id) ? prev : [...prev, row.id]
                                )
                              } else {
                                setSelectedPessoaisIds((prev) =>
                                  prev.filter((id) => id !== row.id)
                                )
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className='align-middle text-left'>
                          {row.nomeDoenca ?? '—'}
                        </TableCell>
                        <TableCell className='align-middle text-center'>
                          {row.ano !== null && row.ano !== undefined ? row.ano : '—'}
                        </TableCell>
                        <TableCell className='align-middle text-center'>
                          {row.idade !== null && row.idade !== undefined ? row.idade : '—'}
                        </TableCell>
                        <TableCell className='align-middle text-center'>
                          {row.data ? format(new Date(row.data), 'dd/MM/yyyy') : '—'}
                        </TableCell>
                        <TableCell className='w-16 text-center align-middle'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Ver detalhes / editar'
                            onClick={() => {
                              setEditingPessoal(row)
                              setPessoaisModalOpen(true)
                            }}
                          >
                            <Search className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='flex shrink-0 flex-col gap-3 rounded border bg-muted/30 p-4 md:w-64'>
              <Label className='text-sm'>Já teve cuidados de saúde?</Label>
              <RadioGroup
                value={cuidadosSaude}
                onValueChange={(v) => {
                  setCuidadosSaude(v as 'sim' | 'nao')
                  if (v === 'nao') {
                    setContinuados(false)
                    setEsporadicos(false)
                  }
                }}
                className='flex gap-2'
              >
                <label className='flex cursor-pointer items-center gap-2'>
                  <RadioGroupItem value='sim' /> Sim
                </label>
                <label className='flex cursor-pointer items-center gap-2'>
                  <RadioGroupItem value='nao' /> Não
                </label>
              </RadioGroup>
              <p className='text-sm'>Se sim, foram:</p>
              <div className='flex gap-2'>
                <label
                  className={`flex items-center gap-2 text-sm ${permitirCheckboxes ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <Checkbox
                    checked={continuados}
                    onCheckedChange={(c) => {
                      if (c === true) {
                        setContinuados(true)
                        setEsporadicos(false)
                      } else {
                        setContinuados(false)
                      }
                    }}
                    disabled={!permitirCheckboxes}
                  />
                  Continuados
                </label>
                <label
                  className={`flex items-center gap-2 text-sm ${permitirCheckboxes ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <Checkbox
                    checked={esporadicos}
                    onCheckedChange={(c) => {
                      if (c === true) {
                        setEsporadicos(true)
                        setContinuados(false)
                      } else {
                        setEsporadicos(false)
                      }
                    }}
                    disabled={!permitirCheckboxes}
                  />
                  Esporádicos
                </label>
              </div>
            </div>
          </div>
          <div className='border-t px-4 py-3'>
            <Label className='text-sm'>Descritivo</Label>
            <Textarea className='mt-1 min-h-[80px]' placeholder='Descritivo...' />
          </div>
        </div>
        <div className='rounded-lg border bg-card'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-teal-50 px-4 py-2 dark:bg-teal-950/30'>
            <h3 className='text-sm font-semibold text-teal-800 dark:text-teal-200'>Antecedentes Cirúrgicos</h3>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                className='gap-1 bg-teal-600 hover:bg-teal-700'
                onClick={() => {
                  setEditingCirurgico(null)
                  setCirurgicoModalOpen(true)
                }}
                disabled={!utenteId}
              >
                <Plus className='h-4 w-4' /> Inserir
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='gap-1'
                onClick={handleRemoverCirurgicoClick}
                disabled={!utenteId || !selectedCirurgicoData || isDeletingCirurgico}
              >
                <X className='h-4 w-4' /> Remover
              </Button>
            </div>
          </div>
          <div className='overflow-x-auto p-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10' />
                  <TableHead>Ano</TableHead>
                  <TableHead>Tipo de Cirurgia</TableHead>
                  <TableHead className='w-16'>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasAntecedentesCirurgicos ? (
                  <TableRow>
                    <TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
                      Não existem dados a apresentar
                    </TableCell>
                  </TableRow>
                ) : (
                  antecedentesCirurgicos.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`cursor-pointer ${selectedCirurgicoData?.id === row.id ? 'bg-teal-50 dark:bg-teal-950/40' : ''}`}
                      onClick={() => setSelectedCirurgico(row)}
                    >
                      <TableCell className='w-10 align-middle'>
                        <Checkbox
                          checked={selectedCirurgicoData?.id === row.id}
                          onCheckedChange={(c) => {
                            if (c === true) {
                              setSelectedCirurgico(row)
                            } else if (selectedCirurgico?.id === row.id) {
                              setSelectedCirurgico(null)
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        {row.ano !== null && row.ano !== undefined ? row.ano : '—'}
                      </TableCell>
                      <TableCell className='align-middle'>
                        {row.tipoCirurgia ?? '—'}
                      </TableCell>
                      <TableCell className='w-16 text-center align-middle'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Ver detalhes / editar'
                          onClick={() => {
                            setEditingCirurgico(row)
                            setCirurgicoModalOpen(true)
                          }}
                        >
                          <Search className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
            <div className='space-y-4 border-t p-4'>
            <p className='text-xs text-muted-foreground'>Dados do registo selecionado (apenas visualização)</p>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-sm'>Ano</Label>
                <Input
                  readOnly
                    value={
                      selectedCirurgicoData && selectedCirurgicoData.ano !== null
                        ? selectedCirurgicoData.ano ?? ''
                        : ''
                    }
                    placeholder='—'
                    className='bg-muted/50 cursor-default'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm'>Tipo de Cirurgia</Label>
                <Input
                  readOnly
                    value={selectedCirurgicoData?.tipoCirurgia ?? ''}
                    placeholder='—'
                    className='bg-muted/50 cursor-default'
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-start gap-2'>
                <Checkbox
                    id='houve-complicacoes'
                    className='mt-1'
                    disabled
                    checked={!!selectedCirurgicoData?.houveComplicacoes}
                  />
                  <Label
                    htmlFor='houve-complicacoes'
                    className='text-sm leading-none text-muted-foreground'
                  >
                    Houve Complicações?
                  </Label>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm'>Complicações</Label>
                <Textarea
                  readOnly
                    value={selectedCirurgicoData?.complicacoes ?? ''}
                    className='min-h-[60px] bg-muted/50 cursor-default resize-none'
                    placeholder='—'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm'>Observações</Label>
              <Textarea
                readOnly
                  value={selectedCirurgicoData?.observacoes ?? ''}
                  className='min-h-[60px] w-full bg-muted/50 cursor-default resize-none'
                  placeholder='—'
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='familiares' className='mt-0 space-y-4'>
        <div className='rounded-lg border bg-card'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-teal-50 px-4 py-2 dark:bg-teal-950/30'>
            <h3 className='text-sm font-semibold text-teal-800 dark:text-teal-200'>Antecedentes Familiares</h3>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                className='gap-1 bg-teal-600 hover:bg-teal-700'
                onClick={() => {
                  setEditingFamiliar(null)
                  setFamiliaresModalOpen(true)
                }}
                disabled={!utenteId}
              >
                <Plus className='h-4 w-4' /> Inserir
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='gap-1'
                onClick={handleRemoverFamiliaresClick}
                disabled={!utenteId || selectedFamiliaresIds.length === 0 || isDeletingFamiliares}
              >
                <X className='h-4 w-4' /> Remover
              </Button>
            </div>
          </div>
          <div className='overflow-x-auto p-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10' />
                  <TableHead className='text-left'>Descrição</TableHead>
                  <TableHead className='text-center'>Ano</TableHead>
                  <TableHead className='text-center'>Idade</TableHead>
                  <TableHead className='text-center'>Data</TableHead>
                  <TableHead className='text-left'>Grau Parentesco</TableHead>
                  <TableHead className='w-16 text-center'>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasAntecedentesFamiliares ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                      Não existem dados a apresentar
                    </TableCell>
                  </TableRow>
                ) : (
                  antecedentesFamiliares.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className='w-10 align-middle'>
                        <Checkbox
                          checked={selectedFamiliaresIds.includes(row.id)}
                          onCheckedChange={(c) => {
                            if (c === true) {
                              setSelectedFamiliaresIds((prev) =>
                                prev.includes(row.id) ? prev : [...prev, row.id]
                              )
                            } else {
                              setSelectedFamiliaresIds((prev) =>
                                prev.filter((id) => id !== row.id)
                              )
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className='align-middle text-left'>
                        {row.nomeDoenca ?? '—'}
                      </TableCell>
                      <TableCell className='align-middle text-center'>
                        {row.ano !== null && row.ano !== undefined ? row.ano : '—'}
                      </TableCell>
                      <TableCell className='align-middle text-center'>
                        {row.idade !== null && row.idade !== undefined ? row.idade : '—'}
                      </TableCell>
                      <TableCell className='align-middle text-center'>
                        {row.data ? format(new Date(row.data), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className='align-middle text-left'>
                        {row.grauParentesco ?? '—'}
                      </TableCell>
                      <TableCell className='w-16 text-center align-middle'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Ver detalhes / editar'
                          onClick={() => {
                            setEditingFamiliar(row)
                            setFamiliaresModalOpen(true)
                          }}
                        >
                          <Search className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className='border-t p-4'>
            <Label className='text-sm'>Observações</Label>
            <Textarea className='mt-1 min-h-[80px]' placeholder='Observações...' />
          </div>
        </div>
      </TabsContent>

      <TabsContent value='alergias' className='mt-0 space-y-4'>
        <div className='rounded-lg border bg-card'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b bg-teal-50 px-4 py-2 dark:bg-teal-950/30'>
            <h3 className='text-sm font-semibold text-teal-800 dark:text-teal-200'>Alergias do Utente</h3>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                className='gap-1 bg-teal-600 hover:bg-teal-700'
                onClick={() => {
                  setEditingAlergiaUtente(null)
                  setAlergiasModalOpen(true)
                }}
                disabled={!utenteId}
              >
                <Plus className='h-4 w-4' /> Inserir
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='gap-1'
                onClick={handleRemoverAlergiasClick}
                disabled={!utenteId || selectedAlergiaIds.length === 0 || isDeletingAlergias}
              >
                <X className='h-4 w-4' /> Remover
              </Button>
            </div>
          </div>
          <div className='overflow-x-auto p-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10 text-left' />
                  <TableHead className='text-left min-w-[140px]'>Descrição</TableHead>
                  <TableHead className='text-left whitespace-nowrap'>Desde</TableHead>
                  <TableHead className='text-left whitespace-nowrap'>Até</TableHead>
                  <TableHead className='text-left whitespace-nowrap'>Data</TableHead>
                  <TableHead className='w-16 text-center'>Editar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasAlergias ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8 text-center text-muted-foreground'>
                      Não existem dados a apresentar
                    </TableCell>
                  </TableRow>
                ) : (
                  alergiasUtente.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className='w-10 align-middle'>
                        <Checkbox
                          checked={selectedAlergiaIds.includes(row.id)}
                          onCheckedChange={(c) => {
                            if (c === true) {
                              setSelectedAlergiaIds((prev) =>
                                prev.includes(row.id) ? prev : [...prev, row.id]
                              )
                            } else {
                              setSelectedAlergiaIds((prev) =>
                                prev.filter((id) => id !== row.id)
                              )
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className='text-left align-middle min-w-[140px]'>
                        {row.alergiaDescricao ?? '—'}
                      </TableCell>
                      <TableCell className='text-left align-middle whitespace-nowrap'>
                        {row.dataDesde ? format(new Date(row.dataDesde), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className='text-left align-middle whitespace-nowrap'>
                        {row.dataAte ? format(new Date(row.dataAte), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className='text-left align-middle whitespace-nowrap'>
                        {row.createdOn ? format(new Date(row.createdOn), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className='text-center align-middle w-16'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Editar'
                          onClick={() => {
                            setEditingAlergiaUtente(row)
                            setAlergiasModalOpen(true)
                          }}
                        >
                          <Search className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className='space-y-4 border-t p-4'>
            <div>
              <Label className='text-sm'>Informação Importante</Label>
              <Textarea className='mt-1 min-h-[80px]' placeholder='Informação importante...' />
            </div>
            <div>
              <Label className='text-sm'>Observações</Label>
              <Textarea className='mt-1 min-h-[80px]' placeholder='Observações...' />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='habitos' className='mt-0 space-y-4'>
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1'
            disabled={!utenteId || saveHabitosMutation.isPending}
            onClick={() => {
              if (!utenteId || !habitosFormRef.current) return

              const formData = new FormData(habitosFormRef.current)

              const getStr = (name: string): string | null => {
                const v = formData.get(name)
                if (v == null) return null
                const s = String(v).trim()
                return s.length > 0 ? s : null
              }

              const data = {
                // campos principais da tabela
                consumoBebidasAlcoolicas: consumoBebidasAlcoolicasChecked,
                fuma: fumaChecked,
                consumoDrogas: consumoDrogasChecked,
                praticaExercicioFisico: praticaExercicioFisicoChecked,

                // Hábitos Alimentares / Etílicos
                consumoDeFrutas: consumoDeFrutasChecked,
                consumoAgua: consumoAguaChecked,
                quantidadeAgua: getStr('quantidadeAgua'),
                consumoPeixe: consumoPeixeChecked,
                consumoCarne: consumoCarneChecked,
                tipoCarne:
                  tipoCarne === 'brancas' ? 1 : tipoCarne === 'vermelhas' ? 2 : null,
                consumoVegetais: consumoVegetaisChecked,
                ingestaoLeite: ingestaoLeiteChecked,
                consumoSalgados: consumoSalgadosChecked,
                consumoAcucarados: consumoAcucaradosChecked,

                bebidasAlcoolicas: getStr('bebidasAlcoolicas'),
                quantidadeAlcool: getStr('quantidadeAlcool'),
                alcoolDesdeQuando: getStr('alcoolDesdeQuando'),

                quantosFumaDia: getStr('quantosFumaDia'),
                tabacoDesdeQuando: getStr('tabacoDesdeQuando'),
                drogas: getStr('drogas'),
                drogasDesdeQuando: getStr('drogasDesdeQuando'),

                outrosVicios: getStr('outrosVicios'),
                outrosViciosDesdeQuando: getStr('outrosViciosDesdeQuando'),

                // Medicamentos / Exercício Físico
                tomaFarmacosPrescritos: tomaFarmacosPrescritosChecked,
                tomaFarmacosSemReceita: tomaFarmacosSemReceita === 'sim',
                farmacosSemReceita: getStr('farmacosSemReceita'),
                tipoExercicioFisico: getStr('tipoExercicioFisico'),
                frequenciaExFisico: getStr('frequenciaExFisico'),

                observacoesHabitosAlimentaresEVicios: getStr(
                  'observacoesHabitosAlimentaresEVicios'
                ),
                observacoesHabitosMedicamentosExercicioFisico: getStr(
                  'observacoesHabitosMedicamentosExercicioFisico'
                ),
              }

              saveHabitosMutation.mutate({
                existingId: habitosEVicios?.id ?? null,
                data,
              })
            }}
          >
            <Save className='h-4 w-4' />
            {saveHabitosMutation.isPending ? 'A guardar…' : 'Guardar Hábitos e Vícios'}
          </Button>
        </div>
        <form ref={habitosFormRef}>
          <div className='rounded-lg border bg-card p-4'>
          <h3 className='mb-3 text-sm font-semibold text-teal-800 dark:text-teal-200'>
            Hábitos e Vícios
          </h3>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant={activeHabitosSection === 'alimentares' ? 'default' : 'outline'}
              size='sm'
              className={`gap-2 rounded-full border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-0 ${
                activeHabitosSection === 'alimentares'
                  ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400'
                  : 'border-teal-300 bg-white text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:bg-transparent dark:text-teal-200 dark:hover:bg-teal-950/40'
              }`}
              onClick={() => setActiveHabitosSection('alimentares')}
            >
              <UtensilsCrossed className='h-4 w-4' />
              Hábitos Alimentares/Etílicos
              <ChevronDown className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant={activeHabitosSection === 'medicamentos' ? 'default' : 'outline'}
              size='sm'
              className={`gap-2 rounded-full border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-0 ${
                activeHabitosSection === 'medicamentos'
                  ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400'
                  : 'border-teal-300 bg-white text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:bg-transparent dark:text-teal-200 dark:hover:bg-teal-950/40'
              }`}
              onClick={() => setActiveHabitosSection('medicamentos')}
            >
              <Heart className='h-4 w-4' />
              Hábitos Medicamentos/Exercício Físico
              <ChevronDown className='h-4 w-4' />
            </Button>
          </div>

          {activeHabitosSection === 'alimentares' && (
            <div className='mt-4 rounded-md border bg-muted/40 p-4'>
              <h4 className='mb-4 text-sm font-semibold text-teal-800 dark:text-teal-100'>
                Hábitos Alimentares
              </h4>
              <div className='grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]'>
                {/* Coluna esquerda - Alimentares */}
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoDeFrutas'
                        checked={consumoDeFrutasChecked}
                        onCheckedChange={(c) =>
                          setConsumoDeFrutasChecked(c === true)
                        }
                      />
                      <span className='text-sm'>
                        Consumo diário de fruta ou sumos de fruta
                      </span>
                    </div>
                    <div className='flex flex-wrap items-center gap-4'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          name='consumoAgua'
                          checked={consumoAguaChecked}
                          onCheckedChange={(c) => setConsumoAguaChecked(c === true)}
                        />
                        <span className='text-sm'>Consumo de Água</span>
                      </div>
                      <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoPeixe'
                        checked={consumoPeixeChecked}
                        onCheckedChange={(c) => setConsumoPeixeChecked(c === true)}
                      />
                        <span className='text-sm'>Consumo de Peixe</span>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Quantidade de Água Consumida</Label>
                      <Input
                        name='quantidadeAgua'
                        placeholder='Quantidade...'
                        defaultValue={habitosEVicios?.quantidadeAgua ?? ''}
                        disabled={!consumoAguaChecked}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoCarne'
                        checked={consumoCarneChecked}
                        onCheckedChange={(c) => setConsumoCarneChecked(c === true)}
                      />
                      <span className='text-sm'>Consumo de Carne</span>
                    </div>
                    <div
                      className={`flex flex-wrap items-center gap-4 pl-6 text-xs ${
                        consumoCarneChecked ? '' : 'pointer-events-none opacity-60'
                      }`}
                    >
                      <label className='flex cursor-pointer items-center gap-1'>
                        <Checkbox
                          className='h-3 w-3'
                          checked={tipoCarne === 'brancas'}
                          onCheckedChange={(c) => {
                            if (!consumoCarneChecked) return
                            if (c === true) setTipoCarne('brancas')
                            else if (tipoCarne === 'brancas') setTipoCarne('')
                          }}
                        />
                        <span>Brancas</span>
                      </label>
                      <label className='flex cursor-pointer items-center gap-1'>
                        <Checkbox
                          className='h-3 w-3'
                          checked={tipoCarne === 'vermelhas'}
                          onCheckedChange={(c) => {
                            if (!consumoCarneChecked) return
                            if (c === true) setTipoCarne('vermelhas')
                            else if (tipoCarne === 'vermelhas') setTipoCarne('')
                          }}
                        />
                        <span>Vermelhas</span>
                      </label>
                    </div>
                  </div>

                  <div className='grid gap-2 md:grid-cols-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoVegetais'
                        checked={consumoVegetaisChecked}
                        onCheckedChange={(c) =>
                          setConsumoVegetaisChecked(c === true)
                        }
                      />
                      <span className='text-sm'>Consumo diário de vegetais frescos</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='ingestaoLeite'
                        checked={ingestaoLeiteChecked}
                        onCheckedChange={(c) => setIngestaoLeiteChecked(c === true)}
                      />
                      <span className='text-sm'>Ingestão de leite e derivados</span>
                    </div>
                  </div>

                  <div className='grid gap-2 md:grid-cols-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoSalgados'
                        checked={consumoSalgadosChecked}
                        onCheckedChange={(c) =>
                          setConsumoSalgadosChecked(c === true)
                        }
                      />
                      <span className='text-sm'>Consumo de alimentos salgados</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoAcucarados'
                        checked={consumoAcucaradosChecked}
                        onCheckedChange={(c) =>
                          setConsumoAcucaradosChecked(c === true)
                        }
                      />
                      <span className='text-sm'>Consumo de alimentos açucarados</span>
                    </div>
                  </div>
                </div>

                {/* Coluna direita - Vícios */}
                <div className='grid gap-4 md:grid-cols-2'>
                  {/* Bebidas Alcoólicas */}
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                      Vícios
                    </p>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoBebidasAlcoolicas'
                        checked={consumoBebidasAlcoolicasChecked}
                        onCheckedChange={(c) =>
                          setConsumoBebidasAlcoolicasChecked(c === true)
                        }
                      />
                      <span className='text-sm'>Consumo de bebidas Alcoólicas</span>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Quais</Label>
                      <Input
                        name='bebidasAlcoolicas'
                        defaultValue={habitosEVicios?.bebidasAlcoolicas ?? ''}
                        disabled={!consumoBebidasAlcoolicasChecked}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Quantidade</Label>
                      <Input
                        name='quantidadeAlcool'
                        defaultValue={habitosEVicios?.quantidadeAlcool ?? ''}
                        disabled={!consumoBebidasAlcoolicasChecked}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Desde quando?</Label>
                      <Input
                        name='alcoolDesdeQuando'
                        type='date'
                        defaultValue={habitosEVicios?.alcoolDesdeQuando ?? ''}
                        disabled={!consumoBebidasAlcoolicasChecked}
                      />
                    </div>
                  </div>

                  {/* Tabágicos / Drogas / Outros */}
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                        Tabágicos
                      </p>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          name='fuma'
                          checked={fumaChecked}
                          onCheckedChange={(c) => setFumaChecked(c === true)}
                        />
                        <span className='text-sm'>Fuma</span>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Quantos Fuma por dia?</Label>
                        <Input
                          name='quantosFumaDia'
                          defaultValue={habitosEVicios?.quantosFumaDia ?? ''}
                          disabled={!fumaChecked}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Desde quando?</Label>
                        <Input
                          name='tabacoDesdeQuando'
                          type='date'
                          defaultValue={habitosEVicios?.tabacoDesdeQuando ?? ''}
                          disabled={!fumaChecked}
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                        Estupefacientes
                      </p>
                      <div className='flex items-center gap-2'>
                      <Checkbox
                        name='consumoDrogas'
                        checked={consumoDrogasChecked}
                        onCheckedChange={(c) =>
                          setConsumoDrogasChecked(c === true)
                        }
                      />
                        <span className='text-sm'>Consumo de Drogas</span>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Quais</Label>
                        <Input name='drogas' defaultValue={habitosEVicios?.drogas ?? ''} />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Desde quando?</Label>
                        <Input
                          name='drogasDesdeQuando'
                          type='date'
                          defaultValue={habitosEVicios?.drogasDesdeQuando ?? ''}
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                        Outros
                      </p>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Outros Vícios</Label>
                        <Textarea
                          name='outrosVicios'
                          className='min-h-[40px]'
                          defaultValue={habitosEVicios?.outrosVicios ?? ''}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs'>Desde quando?</Label>
                        <Input
                          name='outrosViciosDesdeQuando'
                          type='date'
                          defaultValue={habitosEVicios?.outrosViciosDesdeQuando ?? ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <Label className='text-sm'>Observações (Alimentares/Etílicos)</Label>
                <Textarea
                  name='observacoesHabitosAlimentaresEVicios'
                  className='mt-1 min-h-[80px]'
                  placeholder='Observações...'
                  defaultValue={habitosEVicios?.observacoesHabitosAlimentaresEVicios ?? ''}
                />
              </div>
            </div>
          )}

          {activeHabitosSection === 'medicamentos' && (
            <div className='mt-4 rounded-md border bg-muted/40 p-4'>
              <h4 className='mb-4 text-sm font-semibold text-teal-800 dark:text-teal-100'>
                Hábitos Medicamentos / Exercício Físico
              </h4>
              <div className='grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]'>
                {/* Hábitos Medicamentos */}
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                      Hábitos Medicamentos
                    </p>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={tomaFarmacosPrescritosChecked}
                        onCheckedChange={(c) => setTomaFarmacosPrescritosChecked(c === true)}
                      />
                      <span className='text-sm'>Toma fármacos Prescritos</span>
                    </div>
                  </div>

                  {tomaFarmacosPrescritosChecked && (
                    <HabitosMedicamentosTable />
                  )}

                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                      Toma fármacos aviados sem receita médica?
                    </p>
                    <RadioGroup
                      value={tomaFarmacosSemReceita}
                      onValueChange={(v) => setTomaFarmacosSemReceita(v as 'sim' | 'nao')}
                      className='flex items-center gap-4'
                    >
                      <label className='flex cursor-pointer items-center gap-2 text-sm'>
                        <RadioGroupItem value='sim' />
                        Sim
                      </label>
                      <label className='flex cursor-pointer items-center gap-2 text-sm'>
                        <RadioGroupItem value='nao' />
                        Não
                      </label>
                    </RadioGroup>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Quais?</Label>
                      <Input
                        name='farmacosSemReceita'
                        defaultValue={habitosEVicios?.farmacosSemReceita ?? ''}
                        disabled={tomaFarmacosSemReceita !== 'sim'}
                      />
                    </div>
                  </div>
                </div>

                {/* Hábitos Exercício Físico */}
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-teal-700 dark:text-teal-100'>
                      Hábitos Exercício Físico
                    </p>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={praticaExercicioFisicoChecked}
                        onCheckedChange={(c) =>
                          setPraticaExercicioFisicoChecked(c === true)
                        }
                      />
                      <span className='text-sm'>Pratica regularmente exercícios físicos</span>
                    </div>
                  </div>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Tipo</Label>
                      <Input
                        name='tipoExercicioFisico'
                        defaultValue={habitosEVicios?.tipoExercicioFisico ?? ''}
                        disabled={!praticaExercicioFisicoChecked}
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Frequência</Label>
                      <Input
                        name='frequenciaExFisico'
                        defaultValue={habitosEVicios?.frequenciaExFisico ?? ''}
                        disabled={!praticaExercicioFisicoChecked}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <Label className='text-sm'>Observações (Medicamentos / Exercício)</Label>
                <Textarea
                  name='observacoesHabitosMedicamentosExercicioFisico'
                  className='mt-1 min-h-[80px]'
                  placeholder='Observações...'
                  defaultValue={
                    habitosEVicios?.observacoesHabitosMedicamentosExercicioFisico ?? ''
                  }
                />
              </div>
            </div>
          )}
        </div>
        </form>
      </TabsContent>

      <TabsContent value='questionario' className='mt-0 space-y-4'>
        <QuestionarioTab utenteId={utenteId} />
      </TabsContent>

      {/* Modais de edição / criação (sempre montados) */}
      <AlergiasUtenteModal
        open={alergiasModalOpen}
        onOpenChange={(open) => {
          setAlergiasModalOpen(open)
          if (!open) setEditingAlergiaUtente(null)
        }}
        utenteId={utenteId}
        editData={editingAlergiaUtente}
      />
      <AntecedentesPessoaisModal
        open={pessoaisModalOpen}
        onOpenChange={(open) => {
          setPessoaisModalOpen(open)
          if (!open) setEditingPessoal(null)
        }}
        utenteId={utenteId}
        editData={editingPessoal}
      />
      <AntecedentesCirurgicosModal
        open={cirurgicoModalOpen}
        onOpenChange={(open) => {
          setCirurgicoModalOpen(open)
          if (!open) setEditingCirurgico(null)
        }}
        utenteId={utenteId}
        editData={editingCirurgico}
      />
      <AntecedentesFamiliaresUtenteModal
        open={familiaresModalOpen}
        onOpenChange={(open) => {
          setFamiliaresModalOpen(open)
          if (!open) setEditingFamiliar(null)
        }}
        utenteId={utenteId}
        editData={editingFamiliar}
      />
      {/* Dialogos de confirmação de remoção */}
      <AlertDialog open={deleteAlergiasDialogOpen} onOpenChange={setDeleteAlergiasDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover alergias do utente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover as alergias selecionadas? Esta ação não pode ser
              revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAlergias}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmRemoverAlergias()
              }}
              disabled={isDeletingAlergias}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeletingAlergias ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deletePessoaisDialogOpen} onOpenChange={setDeletePessoaisDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover antecedentes pessoais</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover os antecedentes pessoais selecionados? Esta ação
              não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPessoais}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmRemoverPessoais()
              }}
              disabled={isDeletingPessoais}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeletingPessoais ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCirurgicoDialogOpen} onOpenChange={setDeleteCirurgicoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover antecedente cirúrgico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover o antecedente cirúrgico selecionado? Esta ação não
              pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCirurgico}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmRemoverCirurgico()
              }}
              disabled={isDeletingCirurgico}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeletingCirurgico ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteFamiliaresDialogOpen} onOpenChange={setDeleteFamiliaresDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover antecedentes familiares</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover os antecedentes familiares selecionados? Esta ação
              não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFamiliares}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmRemoverFamiliares()
              }}
              disabled={isDeletingFamiliares}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeletingFamiliares ? 'A remover…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}

function HabitosMedicamentosTable() {
  return (
    <div className='mt-2 rounded-md border bg-card'>
      <div className='flex items-center justify-between gap-2 border-b bg-teal-50 px-3 py-2 dark:bg-teal-950/30'>
        <span className='text-sm font-semibold text-teal-800 dark:text-teal-100'>
          Medicamentos Prescritos
        </span>
        <div className='flex items-center gap-2'>
          <Button size='sm' className='gap-1 bg-teal-600 hover:bg-teal-700'>
            <Plus className='h-4 w-4' />
            Inserir
          </Button>
          <Button size='sm' variant='destructive' className='gap-1'>
            <X className='h-4 w-4' />
            Remover
          </Button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10' />
              <TableHead>Nome do Medicamento</TableHead>
              <TableHead className='w-[120px]'>Dose</TableHead>
              <TableHead className='w-[140px]'>Posologia</TableHead>
              <TableHead className='w-[80px] text-center'>Editar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className='py-6 text-center text-xs text-muted-foreground'>
                Não existem dados a apresentar
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


