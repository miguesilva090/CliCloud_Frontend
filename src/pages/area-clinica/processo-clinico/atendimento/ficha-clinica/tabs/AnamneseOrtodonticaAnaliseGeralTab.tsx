import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/utils/toast-utils'
import {
  useCreateAnamneseOrtodonticaAnaliseGeral,
  useGetAnamneseOrtodonticaAnaliseGeralByUtente,
  useUpdateAnamneseOrtodonticaAnaliseGeral,
} from '../queries/anamnese-ortodontica-analise-geral-queries'
import type {
  CreateAnamneseOrtodonticaAnaliseGeralRequest,
  UpdateAnamneseOrtodonticaAnaliseGeralRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-geral.dtos'

interface AnamneseOrtodonticaAnaliseGeralTabProps {
  utenteId: string
}

const initialForm: Omit<CreateAnamneseOrtodonticaAnaliseGeralRequest, 'utenteId'> = {
  simetriaFacial: null,
  desenvolvimentoMaxila: null,
  desenvolvimentoMandibula: null,
  perfilFacial: null,
  alturaFacialInferior: null,
  tipoFacial: null,
  caracteristicasLabios: null,
  relacaoLabioDenteSuperior: null,
  relacaoLabioDenteInferior: null,
  freioLingual: null,
  formaNariz: null,
  tecidosMolesIntrabucais: null,
  distanciaIntercomissuralNasal: null,
  distanciaIntercomissuralPupilar: null,
  adenoides: null,
  amigdalas: null,
}

export function AnamneseOrtodonticaAnaliseGeralTab({
  utenteId,
}: AnamneseOrtodonticaAnaliseGeralTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOrtodonticaAnaliseGeralRequest, 'utenteId'>>(
      initialForm,
    )

  const query = useGetAnamneseOrtodonticaAnaliseGeralByUtente(utenteId)
  const createMutation = useCreateAnamneseOrtodonticaAnaliseGeral(utenteId)
  const updateMutation = useUpdateAnamneseOrtodonticaAnaliseGeral(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        simetriaFacial,
        desenvolvimentoMaxila,
        desenvolvimentoMandibula,
        perfilFacial,
        alturaFacialInferior,
        tipoFacial,
        caracteristicasLabios,
        relacaoLabioDenteSuperior,
        relacaoLabioDenteInferior,
        freioLingual,
        formaNariz,
        tecidosMolesIntrabucais,
        distanciaIntercomissuralNasal,
        distanciaIntercomissuralPupilar,
        adenoides,
        amigdalas,
      } = record

      setForm({
        simetriaFacial,
        desenvolvimentoMaxila,
        desenvolvimentoMandibula,
        perfilFacial,
        alturaFacialInferior,
        tipoFacial,
        caracteristicasLabios,
        relacaoLabioDenteSuperior,
        relacaoLabioDenteInferior,
        freioLingual,
        formaNariz,
        tecidosMolesIntrabucais,
        distanciaIntercomissuralNasal,
        distanciaIntercomissuralPupilar,
        adenoides,
        amigdalas,
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
        const payload: CreateAnamneseOrtodonticaAnaliseGeralRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Análise Geral ortodôntica guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOrtodonticaAnaliseGeralRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('Análise Geral ortodôntica atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao guardar Anamnese Ortodôntica - Análise Geral'
      toast.error(message)
    }
  }

  const loading = query.isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {loading && <p className='text-xs text-muted-foreground'>A carregar...</p>}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <h3 className='text-sm font-semibold text-primary mb-1'>Análise Geral</h3>

          <label className='flex flex-col gap-1 text-sm'>
            Simetria Facial
            <Input
              value={form.simetriaFacial ?? ''}
              onChange={(e) => handleTextChange('simetriaFacial', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Desenvolvimento da Maxila
            <Input
              value={form.desenvolvimentoMaxila ?? ''}
              onChange={(e) =>
                handleTextChange('desenvolvimentoMaxila', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Desenvolvimento da Mandíbula
            <Input
              value={form.desenvolvimentoMandibula ?? ''}
              onChange={(e) =>
                handleTextChange('desenvolvimentoMandibula', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Perfil Facial
            <Input
              value={form.perfilFacial ?? ''}
              onChange={(e) => handleTextChange('perfilFacial', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Altura Facial Inferior
            <Input
              value={form.alturaFacialInferior ?? ''}
              onChange={(e) =>
                handleTextChange('alturaFacialInferior', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Característica dos Lábios
            <Input
              value={form.caracteristicasLabios ?? ''}
              onChange={(e) =>
                handleTextChange('caracteristicasLabios', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Relação Lábio Superior / Dente Superior
            <Input
              value={form.relacaoLabioDenteSuperior ?? ''}
              onChange={(e) =>
                handleTextChange('relacaoLabioDenteSuperior', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Relação Lábio Inferior / Dente Inferior
            <Input
              value={form.relacaoLabioDenteInferior ?? ''}
              onChange={(e) =>
                handleTextChange('relacaoLabioDenteInferior', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Freio Lingual
            <Input
              value={form.freioLingual ?? ''}
              onChange={(e) => handleTextChange('freioLingual', e.target.value)}
            />
          </label>
        </div>

        <div className='space-y-4'>
          <fieldset className='rounded-lg border bg-card p-3'>
            <legend className='px-2 text-sm font-semibold text-primary'>Tipo Facial</legend>
            <RadioGroup
              className='mt-2 flex flex-col gap-3'
              value={form.tipoFacial?.toString() ?? ''}
              onValueChange={(v) => handleRadioChange('tipoFacial', v)}
            >
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='1' />
                <span>Facial</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='2' />
                <span>Mesofacial</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='3' />
                <span>Dolicofacial</span>
              </label>
            </RadioGroup>
          </fieldset>

          <fieldset className='rounded-lg border bg-card p-4'>
            <legend className='px-2 text-sm font-semibold text-primary'>
              Distância Intercomissural
            </legend>
            <div className='mt-2 space-y-3 text-sm'>
              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Em relação à distância internasal
                </p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.distanciaIntercomissuralNasal?.toString() ?? ''}
                  onValueChange={(v) =>
                    handleRadioChange('distanciaIntercomissuralNasal', v)
                  }
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Igual</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Maior</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Menor</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Em relação à distância interpupilar
                </p>
                <RadioGroup
                  className='flex flex-wrap gap-4'
                  value={form.distanciaIntercomissuralPupilar?.toString() ?? ''}
                  onValueChange={(v) =>
                    handleRadioChange('distanciaIntercomissuralPupilar', v)
                  }
                >
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='1' />
                    <span>Igual</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='2' />
                    <span>Maior</span>
                  </label>
                  <label className='flex items-center gap-2'>
                    <RadioGroupItem value='3' />
                    <span>Menor</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
          </fieldset>

          <fieldset className='rounded-lg border bg-card p-4'>
            <legend className='px-2 text-sm font-semibold text-primary'>Adenoides</legend>
            <RadioGroup
              className='mt-0.5 flex flex-wrap gap-3'
              value={form.adenoides?.toString() ?? ''}
              onValueChange={(v) => handleRadioChange('adenoides', v)}
            >
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='1' />
                <span>Ausentes</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='2' />
                <span>Presentes</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='3' />
                <span>Hipertrofiadas</span>
              </label>
            </RadioGroup>
          </fieldset>

          <fieldset className='rounded-lg border bg-card p-4'>
            <legend className='px-2 text-sm font-semibold text-primary'>Amígdalas</legend>
            <RadioGroup
              className='mt-0.5 flex flex-wrap gap-3'
              value={form.amigdalas?.toString() ?? ''}
              onValueChange={(v) => handleRadioChange('amigdalas', v)}
            >
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='1' />
                <span>Ausentes</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='2' />
                <span>Presentes</span>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <RadioGroupItem value='3' />
                <span>Hipertrofiadas</span>
              </label>
            </RadioGroup>
          </fieldset>

          <label className='-mt-1 flex flex-col gap-1 text-sm'>
            Forma do Nariz
            <Input
              value={form.formaNariz ?? ''}
              onChange={(e) => handleTextChange('formaNariz', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Tecidos Moles Intrabucais
          </legend>
          <Textarea
            className='mt-2 min-h-[80px]'
            value={form.tecidosMolesIntrabucais ?? ''}
            onChange={(e) =>
              handleTextChange('tecidosMolesIntrabucais', e.target.value)
            }
          />
        </fieldset>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' size='sm'>
          Guardar Análise Geral
        </Button>
      </div>
    </form>
  )
}


