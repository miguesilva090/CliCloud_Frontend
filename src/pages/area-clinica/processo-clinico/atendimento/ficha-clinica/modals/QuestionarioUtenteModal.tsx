import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QuestionarioUtenteService } from '@/lib/services/processo-clinico/questionario-utente-service'
import { toast } from '@/utils/toast-utils'

export interface QuestionarioUtenteModalProps {
  utenteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function QuestionarioUtenteModal({
  utenteId,
  open,
  onOpenChange,
  onSaved,
}: QuestionarioUtenteModalProps) {
  const [estaFazerTratamento, setEstaFazerTratamento] = useState(false)
  const [duracaoTratamento, setDuracaoTratamento] = useState('')
  const [descTratamento, setDescTratamento] = useState('')

  const [problemasNeurologicos, setProblemasNeurologicos] = useState(false)
  const [problemasNeuromusculares, setProblemasNeuromusculares] = useState(false)
  const [problemasRespiratorios, setProblemasRespiratorios] = useState(false)
  const [problemasArticularesOuReumatismo, setProblemasArticularesOuReumatismo] = useState(false)
  const [tonturasEZumbidosNosOuvidos, setTonturasEZumbidosNosOuvidos] = useState(false)
  const [problemasComportamento, setProblemasComportamento] = useState(false)
  const [problemasRenais, setProblemasRenais] = useState(false)
  const [tonturasCardiovasculares, setTonturasCardiovasculares] = useState(false)
  const [problemasDigestivos, setProblemasDigestivos] = useState(false)
  const [problemasGastricos, setProblemasGastricos] = useState(false)
  const [febreReumatica, setFebreReumatica] = useState(false)
  const [problemasIntestinais, setProblemasIntestinais] = useState(false)
  const [problemasUrinarios, setProblemasUrinarios] = useState(false)
  const [problemasComAnestesia, setProblemasComAnestesia] = useState(false)
  const [problemasDeHomorragia, setProblemasDeHomorragia] = useState(false)
  const [problemasFormigueiroDormencia, setProblemasFormigueiroDormencia] = useState(false)
  const [problemasCicratizacao, setProblemasCicratizacao] = useState(false)
  const [hepatiteSida, setHepatiteSida] = useState(false)
  const [gravidez, setGravidez] = useState(false)
  const [sedeEBocaSeca, setSedeEBocaSeca] = useState(false)
  const [usaPacemaker, setUsaPacemaker] = useState(false)
  const [doencaAutoImune, setDoencaAutoImune] = useState(false)
  const [doencaCronica, setDoencaCronica] = useState(false)
  const [doencaGenetica, setDoencaGenetica] = useState(false)

  const [problemasDiabetes, setProblemasDiabetes] = useState(false)
  const [tipoDiabetes, setTipoDiabetes] = useState<string | undefined>(undefined)

  const [tensaoArterial, setTensaoArterial] = useState(false)
  const [tipoTensaoArterial, setTipoTensaoArterial] = useState<string | undefined>(undefined)

  const [colestrol, setColestrol] = useState(false)
  const [tipoColestrol, setTipoColestrol] = useState<string | undefined>(undefined)

  const [observacoes, setObservacoes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSubcampoDiabetesDisabled = !problemasDiabetes
  const isSubcampoTensaoDisabled = !tensaoArterial
  const isSubcampoColestrolDisabled = !colestrol

  const resetForm = () => {
    setEstaFazerTratamento(false)
    setDuracaoTratamento('')
    setDescTratamento('')
    setProblemasNeurologicos(false)
    setProblemasNeuromusculares(false)
    setProblemasRespiratorios(false)
    setProblemasArticularesOuReumatismo(false)
    setTonturasEZumbidosNosOuvidos(false)
    setProblemasComportamento(false)
    setProblemasRenais(false)
    setTonturasCardiovasculares(false)
    setProblemasDigestivos(false)
    setProblemasGastricos(false)
    setFebreReumatica(false)
    setProblemasIntestinais(false)
    setProblemasUrinarios(false)
    setProblemasComAnestesia(false)
    setProblemasDeHomorragia(false)
    setProblemasFormigueiroDormencia(false)
    setProblemasCicratizacao(false)
    setHepatiteSida(false)
    setGravidez(false)
    setSedeEBocaSeca(false)
    setUsaPacemaker(false)
    setDoencaAutoImune(false)
    setDoencaCronica(false)
    setDoencaGenetica(false)
    setProblemasDiabetes(false)
    setTipoDiabetes(undefined)
    setTensaoArterial(false)
    setTipoTensaoArterial(undefined)
    setColestrol(false)
    setTipoColestrol(undefined)
    setObservacoes('')
  }

  const handleClose = () => {
    if (submitting) return
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!utenteId) {
      toast.error('Nenhum utente selecionado.')
      return
    }
    try {
      setSubmitting(true)
      const client = QuestionarioUtenteService()
      await client.create({
        utenteId,
        estaFazerTratamento,
        duracaoTratamento: estaFazerTratamento ? duracaoTratamento || null : null,
        descTratamento: estaFazerTratamento ? descTratamento || null : null,
        problemasNeurologicos,
        problemasNeuromusculares,
        problemasRespiratorios,
        problemasArticularesOuReumatismo,
        tonturasEZumbidosNosOuvidos,
        problemasComportamento,
        problemasRenais,
        tonturasCardiovasculares,
        problemasDigestivos,
        problemasGastricos,
        febreReumatica,
        problemasIntestinais,
        problemasUrinarios,
        problemasComAnestesia,
        problemasDeHomorragia,
        problemasFormigueiroDormencia,
        problemasCicratizacao,
        hepatiteSida,
        gravidez,
        sedeEBocaSeca,
        usaPacemaker,
        doencaAutoImune,
        doencaCronica,
        doencaGenetica,
        problemasDiabetes,
        tipoDiabetes: problemasDiabetes ? (tipoDiabetes ? Number(tipoDiabetes) : null) : null,
        tensaoArterial,
        tipoTensaoArterial: tensaoArterial
          ? tipoTensaoArterial
            ? Number(tipoTensaoArterial)
            : null
          : null,
        colestrol,
        tipoColestrol: colestrol ? (tipoColestrol ? Number(tipoColestrol) : null) : null,
        observacoes: observacoes || null,
      })
      toast.success('Questionário guardado com sucesso.')
      resetForm()
      onOpenChange(false)
      onSaved?.()
    } catch {
      toast.error('Erro ao guardar questionário.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Questionário</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 py-3'>
          <div className='grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)]'>
            <div className='space-y-3 rounded border p-3'>
              <Label className='flex items-center gap-3'>
                Está a fazer tratamento médico?
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    <Checkbox
                      id='tratamento-sim'
                      checked={estaFazerTratamento}
                      onCheckedChange={(c) => setEstaFazerTratamento(c === true)}
                    />
                    <span className='text-sm'>Sim</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Checkbox
                      id='tratamento-nao'
                      checked={!estaFazerTratamento}
                      onCheckedChange={(c) => setEstaFazerTratamento(c === false)}
                    />
                    <span className='text-sm'>Não</span>
                  </div>
                </div>
              </Label>
              <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2'>
                <div className='space-y-1'>
                  <Label htmlFor='duracaoTratamento'>Se sim: Duração</Label>
                  <Input
                    id='duracaoTratamento'
                    value={duracaoTratamento}
                    onChange={(e) => setDuracaoTratamento(e.target.value)}
                    disabled={!estaFazerTratamento}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='descTratamento'>Qual?</Label>
                  <Input
                    id='descTratamento'
                    value={descTratamento}
                    onChange={(e) => setDescTratamento(e.target.value)}
                    disabled={!estaFazerTratamento}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Problemas de saúde */}
          <div className='space-y-0'>
            <Label className='text-sm font-medium'>Problemas de Saúde</Label>
            <div className='rounded-md border bg-muted/40 p-3'>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-neurologicos'
                    checked={problemasNeurologicos}
                    onCheckedChange={(c) => setProblemasNeurologicos(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Neurológicos</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-neuromusculares'
                    checked={problemasNeuromusculares}
                    onCheckedChange={(c) => setProblemasNeuromusculares(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Neuromusculares</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-respiratorios'
                    checked={problemasRespiratorios}
                    onCheckedChange={(c) => setProblemasRespiratorios(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Respiratórios</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-articulares'
                    checked={problemasArticularesOuReumatismo}
                    onCheckedChange={(c) => setProblemasArticularesOuReumatismo(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Articulares ou Reumatismo</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='tonturas-zumbidos'
                    checked={tonturasEZumbidosNosOuvidos}
                    onCheckedChange={(c) => setTonturasEZumbidosNosOuvidos(c === true)}
                    className='mt-0.5'
                  />
                  <span>Tonturas e zumbidos nos ouvidos</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-comportamento'
                    checked={problemasComportamento}
                    onCheckedChange={(c) => setProblemasComportamento(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas de comportamento</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-renais'
                    checked={problemasRenais}
                    onCheckedChange={(c) => setProblemasRenais(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Renais</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-cardiovasculares'
                    checked={tonturasCardiovasculares}
                    onCheckedChange={(c) => setTonturasCardiovasculares(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Cardiovasculares</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-digestivos'
                    checked={problemasDigestivos}
                    onCheckedChange={(c) => setProblemasDigestivos(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Digestivos</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-gastricos'
                    checked={problemasGastricos}
                    onCheckedChange={(c) => setProblemasGastricos(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Gástricos</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='febre-reumatica'
                    checked={febreReumatica}
                    onCheckedChange={(c) => setFebreReumatica(c === true)}
                    className='mt-0.5'
                  />
                  <span>Febre Reumática</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-intestinais'
                    checked={problemasIntestinais}
                    onCheckedChange={(c) => setProblemasIntestinais(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Intestinais</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-urinarios'
                    checked={problemasUrinarios}
                    onCheckedChange={(c) => setProblemasUrinarios(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas Urinários</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-anestesia'
                    checked={problemasComAnestesia}
                    onCheckedChange={(c) => setProblemasComAnestesia(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas com Anestesia</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-homorragia'
                    checked={problemasDeHomorragia}
                    onCheckedChange={(c) => setProblemasDeHomorragia(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas de Hemorragia</span>
                </label>
                <label className='flex items-start gap-2 text-sm sm:col-span-2 lg:col-span-3'>
                  <Checkbox
                    id='prob-formigueiro'
                    checked={problemasFormigueiroDormencia}
                    onCheckedChange={(c) => setProblemasFormigueiroDormencia(c === true)}
                    className='mt-0.5'
                  />
                  <span>
                    Problemas de formigueiro ou dormência nos braços, pernas ou pés
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Outras Condições</Label>
            <div className='rounded-md border bg-muted/40 p-3'>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='prob-cicatrizacao'
                    checked={problemasCicratizacao}
                    onCheckedChange={(c) => setProblemasCicratizacao(c === true)}
                    className='mt-0.5'
                  />
                  <span>Problemas com a cicatrização</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='hepatite-sida'
                    checked={hepatiteSida}
                    onCheckedChange={(c) => setHepatiteSida(c === true)}
                    className='mt-0.5'
                  />
                  <span>Hepatite/SIDA</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='gravidez'
                    checked={gravidez}
                    onCheckedChange={(c) => setGravidez(c === true)}
                    className='mt-0.5'
                  />
                  <span>Gravidez</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='sede-boca-seca'
                    checked={sedeEBocaSeca}
                    onCheckedChange={(c) => setSedeEBocaSeca(c === true)}
                    className='mt-0.5'
                  />
                  <span>Sede e Boca Seca</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='usa-pacemaker'
                    checked={usaPacemaker}
                    onCheckedChange={(c) => setUsaPacemaker(c === true)}
                    className='mt-0.5'
                  />
                  <span>Usa Pacemaker?</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='doenca-autoimune'
                    checked={doencaAutoImune}
                    onCheckedChange={(c) => setDoencaAutoImune(c === true)}
                    className='mt-0.5'
                  />
                  <span>Doença Autoimune</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='doenca-cronica'
                    checked={doencaCronica}
                    onCheckedChange={(c) => setDoencaCronica(c === true)}
                    className='mt-0.5'
                  />
                  <span>Doença Crónica</span>
                </label>
                <label className='flex items-start gap-2 text-sm'>
                  <Checkbox
                    id='doenca-genetica'
                    checked={doencaGenetica}
                    onCheckedChange={(c) => setDoencaGenetica(c === true)}
                    className='mt-0.5'
                  />
                  <span>Doença Genética</span>
                </label>
              </div>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2 rounded border p-3'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='prob-diabetes'
                  checked={problemasDiabetes}
                  onCheckedChange={(c) => setProblemasDiabetes(c === true)}
                />
                <span className='text-sm font-medium'>Problemas de Diabetes</span>
              </div>
              <RadioGroup
                className='mt-1 flex gap-4'
                value={tipoDiabetes}
                onValueChange={setTipoDiabetes}
                disabled={isSubcampoDiabetesDisabled}
              >
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='0' id='diabetes-tipo1' />
                  <Label htmlFor='diabetes-tipo1' className='text-xs'>
                    Tipo 1
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='1' id='diabetes-tipo2' />
                  <Label htmlFor='diabetes-tipo2' className='text-xs'>
                    Tipo 2
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='2' id='diabetes-gestacional' />
                  <Label htmlFor='diabetes-gestacional' className='text-xs'>
                    Gestacional
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2 rounded border p-3'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='tensao-arterial'
                  checked={tensaoArterial}
                  onCheckedChange={(c) => setTensaoArterial(c === true)}
                />
                <span className='text-sm font-medium'>Tensão Arterial</span>
              </div>
              <RadioGroup
                className='mt-1 flex gap-4'
                value={tipoTensaoArterial}
                onValueChange={setTipoTensaoArterial}
                disabled={isSubcampoTensaoDisabled}
              >
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='0' id='tensao-alta' />
                  <Label htmlFor='tensao-alta' className='text-xs'>
                    Alta
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='1' id='tensao-baixa' />
                  <Label htmlFor='tensao-baixa' className='text-xs'>
                    Baixa
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='2' id='tensao-normal' />
                  <Label htmlFor='tensao-normal' className='text-xs'>
                    Normal
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='colestrol'
                  checked={colestrol}
                  onCheckedChange={(c) => setColestrol(c === true)}
                />
                <span className='text-sm font-medium'>Colesterol</span>
              </div>
              <RadioGroup
                className='mt-1 flex gap-4'
                value={tipoColestrol}
                onValueChange={setTipoColestrol}
                disabled={isSubcampoColestrolDisabled}
              >
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='0' id='colestrol-desejavel' />
                  <Label htmlFor='colestrol-desejavel' className='text-xs'>
                    Desejável
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='1' id='colestrol-limite' />
                  <Label htmlFor='colestrol-limite' className='text-xs'>
                    Limítrofe
                  </Label>
                </div>
                <div className='flex items-center gap-1'>
                  <RadioGroupItem value='2' id='colestrol-alto' />
                  <Label htmlFor='colestrol-alto' className='text-xs'>
                    Alto
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='observacoes'>Observações</Label>
            <Textarea
              id='observacoes'
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !utenteId} className='bg-teal-600 hover:bg-teal-700'>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

