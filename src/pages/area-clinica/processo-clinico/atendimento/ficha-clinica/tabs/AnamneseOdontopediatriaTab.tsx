import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/utils/toast-utils'
import {
  useGetAnamneseOdontopediatriaByUtente,
  useCreateAnamneseOdontopediatria,
  useUpdateAnamneseOdontopediatria,
} from '../queries/anamnese-odontopediatria-queries'

import type {
  CreateAnamneseOdontopediatriaRequest,
  UpdateAnamneseOdontopediatriaRequest,
} from '@/types/dtos/saude/anamnese-odontopediatria.dtos'

interface AnamneseOdontopediatriaTabProps {
  utenteId: string
}

const initialForm: Omit<CreateAnamneseOdontopediatriaRequest, 'utenteId'> = {
  peso: null,
  altura: null,
  pesoPai: null,
  alturaPai: null,
  pesoMae: null,
  alturaMae: null,
  caracteristicasGeraisDesenvolvimento: null,
  tipoAmamentacao: null,
  observacaoCardiaca: null,
  observacaoRespiracao: null,
  observacaoDiccao: null,
  observacoesAdicionais: null,
}

export function AnamneseOdontopediatriaTab({ utenteId }: AnamneseOdontopediatriaTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOdontopediatriaRequest, 'utenteId'>>(initialForm)

  const query = useGetAnamneseOdontopediatriaByUtente(utenteId)
  const createMutation = useCreateAnamneseOdontopediatria(utenteId)
  const updateMutation = useUpdateAnamneseOdontopediatria(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        peso,
        altura,
        pesoPai,
        alturaPai,
        pesoMae,
        alturaMae,
        caracteristicasGeraisDesenvolvimento,
        tipoAmamentacao,
        observacaoCardiaca,
        observacaoRespiracao,
        observacaoDiccao,
        observacoesAdicionais,
      } = record

      setForm({
        peso,
        altura,
        pesoPai,
        alturaPai,
        pesoMae,
        alturaMae,
        caracteristicasGeraisDesenvolvimento,
        tipoAmamentacao,
        observacaoCardiaca,
        observacaoRespiracao,
        observacaoDiccao,
        observacoesAdicionais,
      })
    } else {
      setForm(initialForm)
    }
  }, [record?.id, utenteId])

  const handleNumberChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === '' ? null : Number(value),
    }))
  }

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
        const payload: CreateAnamneseOdontopediatriaRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Anamnese Odontopediatria guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOdontopediatriaRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('Anamnese Odontopediatria atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao guardar Anamnese Odontopediátrica'
      toast.error(message)
    }
  }

  const loading = query.isLoading || createMutation.isPending || updateMutation.isPending

  // Altura é guardada em centímetros -> converter para metros para o IMC
  const imc = useMemo(() => {
    if (form.peso && form.altura && form.peso > 0 && form.altura > 0) {
      const alturaMetros = form.altura / 100
      return form.peso / (alturaMetros * alturaMetros)
    }
    return null
  }, [form.peso, form.altura])

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {loading && <p className='text-xs text-muted-foreground'>A carregar...</p>}

      {/* Linha superior: Peso, Altura, IMC */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <label className='flex flex-col gap-1 text-sm'>
          Peso (kg)
          <Input
            type='number'
            step='0.01'
            value={form.peso ?? ''}
            onChange={(e) => handleNumberChange('peso', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Altura (cm)
          <Input
            type='number'
            step='0.01'
            value={form.altura ?? ''}
            onChange={(e) => handleNumberChange('altura', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          IMC
          <Input
            readOnly
            className='bg-muted'
            value={imc ? imc.toFixed(2) : ''}
            placeholder='NaN - undefined'
          />
        </label>
      </div>

      {/* Linha seguinte: pesos/alturas dos pais */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <label className='flex flex-col gap-1 text-sm'>
          Peso do Pai (kg)
          <Input
            type='number'
            step='0.01'
            value={form.pesoPai ?? ''}
            onChange={(e) => handleNumberChange('pesoPai', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Altura do Pai (cm)
          <Input
            type='number'
            step='0.01'
            value={form.alturaPai ?? ''}
            onChange={(e) => handleNumberChange('alturaPai', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Peso da Mãe (kg)
          <Input
            type='number'
            step='0.01'
            value={form.pesoMae ?? ''}
            onChange={(e) => handleNumberChange('pesoMae', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Altura da Mãe (cm)
          <Input
            type='number'
            step='0.01'
            value={form.alturaMae ?? ''}
            onChange={(e) => handleNumberChange('alturaMae', e.target.value)}
          />
        </label>
      </div>

      {/* Características gerais do desenvolvimento */}
      <fieldset className='mt-2 rounded-lg border bg-card p-4'>
        <legend className='px-2 text-sm font-semibold text-primary'>
          Características Gerais do Desenvolvimento
        </legend>
        <RadioGroup
          className='mt-2 grid grid-cols-2 md:grid-cols-4 gap-4'
          value={form.caracteristicasGeraisDesenvolvimento?.toString() ?? ''}
          onValueChange={(v) =>
            handleRadioChange('caracteristicasGeraisDesenvolvimento', v)
          }
        >
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='1' />
            <span>Infância</span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='2' />
            <span>Pré-puberdade</span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='3' />
            <span>Puberdade</span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='4' />
            <span>Pró-puberdade</span>
          </label>
        </RadioGroup>
      </fieldset>

      {/* Linha de blocos: Tipo amamentação + Observação Cardíaca */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Tipo de amamentação
          </legend>
          <RadioGroup
            className='mt-2 grid gap-3'
            value={form.tipoAmamentacao?.toString() ?? ''}
            onValueChange={(v) => handleRadioChange('tipoAmamentacao', v)}
          >
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='1' />
              <span>Amamentação materna</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='2' />
              <span>Amamentação artificial</span>
            </label>
          </RadioGroup>
        </fieldset>

        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Observação Cardíaca
          </legend>
          <RadioGroup
            className='mt-2 grid gap-3'
            value={form.observacaoCardiaca?.toString() ?? ''}
            onValueChange={(v) => handleRadioChange('observacaoCardiaca', v)}
          >
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='1' />
              <span>Normal</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='2' />
              <span>Exagerada</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='3' />
              <span>Defeciente</span>
            </label>
          </RadioGroup>
        </fieldset>
      </div>

      {/* Linha de blocos: Observação respiração + Observação dicção */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Observação da Respiração
          </legend>
          <RadioGroup
            className='mt-2 grid gap-3'
            value={form.observacaoRespiracao?.toString() ?? ''}
            onValueChange={(v) => handleRadioChange('observacaoRespiracao', v)}
          >
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='1' />
              <span>Normal</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='2' />
              <span>Exagerada</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='3' />
              <span>Defeciente</span>
            </label>
          </RadioGroup>
        </fieldset>

        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Observação da Dicção
          </legend>
          <RadioGroup
            className='mt-2 grid gap-3'
            value={form.observacaoDiccao?.toString() ?? ''}
            onValueChange={(v) => handleRadioChange('observacaoDiccao', v)}
          >
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='1' />
              <span>Normal</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='2' />
              <span>Exagerada</span>
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <RadioGroupItem value='3' />
              <span>Defeciente</span>
            </label>
          </RadioGroup>
        </fieldset>
      </div>

      {/* Observações adicionais */}
      <div>
        <label className='flex flex-col gap-1 text-sm'>
          Observações adicionais
          <Textarea
            value={form.observacoesAdicionais ?? ''}
            onChange={(e) => handleTextChange('observacoesAdicionais', e.target.value)}
            rows={4}
          />
        </label>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' disabled={loading}>
          {record ? 'Atualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
