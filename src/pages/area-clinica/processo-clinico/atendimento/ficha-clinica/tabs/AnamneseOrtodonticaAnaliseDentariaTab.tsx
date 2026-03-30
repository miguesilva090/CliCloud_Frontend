import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/utils/toast-utils'
import {
  useCreateAnamneseOrtodonticaAnaliseDentaria,
  useGetAnamneseOrtodonticaAnaliseDentariaByUtente,
  useUpdateAnamneseOrtodonticaAnaliseDentaria,
} from '../queries/anamnese-ortodontica-analise-dentaria-queries'
import type {
  CreateAnamneseOrtodonticaAnaliseDentariaRequest,
  UpdateAnamneseOrtodonticaAnaliseDentariaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-dentaria.dtos'

interface AnamneseOrtodonticaAnaliseDentariaTabProps {
  utenteId: string
}

const initialForm: Omit<CreateAnamneseOrtodonticaAnaliseDentariaRequest, 'utenteId'> = {
  tipoDentadura: null,
  anomalia: null,
  relacaoMolar: null,
  subDivisaoMolar: null,
  relacaoCanino: null,
  subDivisaoCanino: null,
  relacaoMolar2: null,
  linhaMedianaSuperior: null,
  linhaMedianaInferior: null,
  linhaMedianaDente: null,
  mordidaCruzada: null,
  mordidaAberta: null,
  trespasseVertical: null,
  trespasseHorizontal: null,
  curvaSpee: null,
  caracArcoDentarioMaxila: null,
  caracArcoDentarioMandibula: null,
  caracPalato: null,
  obs: null,
}

export function AnamneseOrtodonticaAnaliseDentariaTab({
  utenteId,
}: AnamneseOrtodonticaAnaliseDentariaTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOrtodonticaAnaliseDentariaRequest, 'utenteId'>>(
      initialForm,
    )

  const query = useGetAnamneseOrtodonticaAnaliseDentariaByUtente(utenteId)
  const createMutation = useCreateAnamneseOrtodonticaAnaliseDentaria(utenteId)
  const updateMutation = useUpdateAnamneseOrtodonticaAnaliseDentaria(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        tipoDentadura,
        anomalia,
        relacaoMolar,
        subDivisaoMolar,
        relacaoCanino,
        subDivisaoCanino,
        relacaoMolar2,
        linhaMedianaSuperior,
        linhaMedianaInferior,
        linhaMedianaDente,
        mordidaCruzada,
        mordidaAberta,
        trespasseVertical,
        trespasseHorizontal,
        curvaSpee,
        caracArcoDentarioMaxila,
        caracArcoDentarioMandibula,
        caracPalato,
        obs,
      } = record

      setForm({
        tipoDentadura,
        anomalia,
        relacaoMolar,
        subDivisaoMolar,
        relacaoCanino,
        subDivisaoCanino,
        relacaoMolar2,
        linhaMedianaSuperior,
        linhaMedianaInferior,
        linhaMedianaDente,
        mordidaCruzada,
        mordidaAberta,
        trespasseVertical,
        trespasseHorizontal,
        curvaSpee,
        caracArcoDentarioMaxila,
        caracArcoDentarioMandibula,
        caracPalato,
        obs,
      })
    } else {
      setForm(initialForm)
    }
  }, [record?.id, utenteId])

  const handleTextChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }))
  }

  const handleRadioChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === '' ? null : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!record) {
        const payload: CreateAnamneseOrtodonticaAnaliseDentariaRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Análise Dentária ortodôntica guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOrtodonticaAnaliseDentariaRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('Análise Dentária ortodôntica atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao guardar Anamnese Ortodôntica - Análise Dentária'
      toast.error(message)
    }
  }

  const loading = query.isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {loading && <p className='text-xs text-muted-foreground'>A carregar...</p>}

      <div className='-mt-2 grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='space-y-3'>
          <h3 className='text-sm font-semibold text-primary'>Análise Dentária</h3>

          <fieldset className='rounded-lg border bg-card p-4 '>
            <legend className='px-2 text-sm font-semibold text-primary'>
              Tipo de Dentadura
            </legend>
            <RadioGroup
              className='mt-2 flex flex-wrap gap-4'
              value={form.tipoDentadura?.toString() ?? ''}
              onValueChange={(v) => handleRadioChange('tipoDentadura', v)}
            >
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='1' />
                <span>Decídua</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='2' />
                <span>Mista</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='3' />
                <span>Permanente</span>
              </label>
            </RadioGroup>
          </fieldset>

          <fieldset className='rounded-lg border bg-card p-4 '>
            <legend className='px-2 text-sm font-semibold text-primary'>
              Relação Molar
            </legend>
            <div className='mt-2 grid gap-3 text-sm'>
              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Relação Molar</p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.relacaoMolar?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('relacaoMolar', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Classe I</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Classe II</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Classe III</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Sub-divisão</p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.subDivisaoMolar?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('subDivisaoMolar', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Esquerda</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Direita</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Relação Molar</p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.relacaoMolar2?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('relacaoMolar2', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Total</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>2/3</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>1/3</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
          </fieldset>
        </div>

        <div className='space-y-3'>
          <fieldset className='rounded-lg border bg-card p-4'>
            <legend className='px-2 text-sm font-semibold text-primary'>
              Relação Canina
            </legend>
            <div className='mt-2 grid gap-3 text-sm'>
              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Relação Canina</p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.relacaoCanino?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('relacaoCanino', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Classe I</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Classe II</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Classe III</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Sub-divisão</p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.subDivisaoCanino?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('subDivisaoCanino', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Esquerda</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Direita</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
          </fieldset>

          <fieldset className='rounded-lg border bg-card p-4'>
            <legend className='px-2 text-sm font-semibold text-primary'>
              Características
            </legend>
            <div className='mt-2 grid gap-3 text-sm'>
              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Características do Arco Dentário (Maxila)
                </p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.caracArcoDentarioMaxila?.toString() ?? ''}
                  onValueChange={(v) =>
                    handleRadioChange('caracArcoDentarioMaxila', v)
                  }
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Normal</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Artésico</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Expandida</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Características do Arco Dentário (Mandíbula)
                </p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.caracArcoDentarioMandibula?.toString() ?? ''}
                  onValueChange={(v) =>
                    handleRadioChange('caracArcoDentarioMandibula', v)
                  }
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Normal</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Artésico</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Expandida</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Características do Palato
                </p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.caracPalato?.toString() ?? ''}
                  onValueChange={(v) => handleRadioChange('caracPalato', v)}
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Normal</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Artésico</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Expandida</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='space-y-3'>
          <h4 className='text-xs font-semibold text-primary'>Linha Mediana</h4>

          <label className='flex flex-col gap-1 text-sm'>
            Linha Superior / Plano Sagital
            <Input
              value={form.linhaMedianaSuperior ?? ''}
              onChange={(e) =>
                handleTextChange('linhaMedianaSuperior', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Linha Inferior / Plano Sagital
            <Input
              value={form.linhaMedianaInferior ?? ''}
              onChange={(e) =>
                handleTextChange('linhaMedianaInferior', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Dente / Dente
            <Input
              value={form.linhaMedianaDente ?? ''}
              onChange={(e) => handleTextChange('linhaMedianaDente', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Curva de Spee
            <Input
              value={form.curvaSpee ?? ''}
              onChange={(e) => handleTextChange('curvaSpee', e.target.value)}
            />
          </label>
        </div>

        <div className='mt-7 space-y-3'>
          <label className='flex flex-col gap-1 text-sm'>
            Mordida Cruzada
            <Input
              value={form.mordidaCruzada ?? ''}
              onChange={(e) => handleTextChange('mordidaCruzada', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Mordida Aberta
            <Input
              value={form.mordidaAberta ?? ''}
              onChange={(e) => handleTextChange('mordidaAberta', e.target.value)}
            />
          </label>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <label className='flex flex-col gap-1 text-sm'>
              Trespasse Vertical
              <Input
                value={form.trespasseVertical ?? ''}
                onChange={(e) => handleTextChange('trespasseVertical', e.target.value)}
              />
            </label>

            <label className='flex flex-col gap-1 text-sm'>
              Trespasse Horizontal
              <Input
                value={form.trespasseHorizontal ?? ''}
                onChange={(e) =>
                  handleTextChange('trespasseHorizontal', e.target.value)
                }
              />
            </label>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <fieldset className='lg:col-span-2 rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Observações
          </legend>
          <Textarea
            className='mt-2 min-h-[96px]'
            value={form.obs ?? ''}
            onChange={(e) => handleTextChange('obs', e.target.value)}
          />
        </fieldset>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' size='sm'>
          Guardar Análise Dentária
        </Button>
      </div>
    </form>
  )
}


