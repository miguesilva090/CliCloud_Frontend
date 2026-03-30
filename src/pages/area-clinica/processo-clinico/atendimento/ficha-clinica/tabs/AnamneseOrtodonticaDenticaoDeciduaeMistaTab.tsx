import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/utils/toast-utils'
import {
  useCreateAnamneseOrtodonticaDenticaoDeciduaeMista,
  useGetAnamneseOrtodonticaDenticaoDeciduaeMistaByUtente,
  useUpdateAnamneseOrtodonticaDenticaoDeciduaeMista,
} from '../queries/anamnese-ortodontica-denticao-decidua-e-mista-queries'
import type {
  CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
  UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-denticao-decidua-e-mista.dtos'

interface AnamneseOrtodonticaDenticaoDeciduaeMistaTabProps {
  utenteId: string
}

const initialForm: Omit<
  CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
  'utenteId'
> = {
  relacaoMolarDecidua: null,
  dentaduraMista: null,
  sequenciaEsfoliacao: null,
  sequenciaErupcao: null,
  estagioCalcificacao: null,
}

export function AnamneseOrtodonticaDenticaoDeciduaeMistaTab({
  utenteId,
}: AnamneseOrtodonticaDenticaoDeciduaeMistaTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest, 'utenteId'>>(
      initialForm,
    )

  const query = useGetAnamneseOrtodonticaDenticaoDeciduaeMistaByUtente(utenteId)
  const createMutation = useCreateAnamneseOrtodonticaDenticaoDeciduaeMista(utenteId)
  const updateMutation = useUpdateAnamneseOrtodonticaDenticaoDeciduaeMista(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        relacaoMolarDecidua,
        dentaduraMista,
        sequenciaEsfoliacao,
        sequenciaErupcao,
        estagioCalcificacao,
      } = record

      setForm({
        relacaoMolarDecidua,
        dentaduraMista,
        sequenciaEsfoliacao,
        sequenciaErupcao,
        estagioCalcificacao,
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

  const handleRadioChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      relacaoMolarDecidua: value === '' ? null : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!record) {
        const payload: CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Dentição Decídua e Mista guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('Dentição Decídua e Mista atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao guardar Anamnese Ortodôntica - Dentição Decídua e Mista'
      toast.error(message)
    }
  }

  const loading = query.isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {loading && <p className='text-xs text-muted-foreground'>A carregar...</p>}

      <fieldset className='rounded-lg border bg-card p-4 space-y-3'>
        <legend className='px-2 text-sm font-semibold text-primary'>
          Relação Molar Decídua
        </legend>
        <RadioGroup
          className='mt-1 flex flex-wrap gap-4'
          value={form.relacaoMolarDecidua?.toString() ?? ''}
          onValueChange={handleRadioChange}
        >
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='1' />
            <span>Degrau Reto</span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='2' />
            <span>Degrau Mesial</span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <RadioGroupItem value='3' />
            <span>Degrau Distal</span>
          </label>
        </RadioGroup>
      </fieldset>

      <div className='grid grid-cols-1 gap-4'>
        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Dentadura Mista
          </legend>
          <Textarea
            className='mt-2 min-h-[80px]'
            value={form.dentaduraMista ?? ''}
            onChange={(e) => handleTextChange('dentaduraMista', e.target.value)}
          />
        </fieldset>

        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Sequência de Esfoliação dos Permanentes
          </legend>
          <Textarea
            className='mt-2 min-h-[80px]'
            value={form.sequenciaEsfoliacao ?? ''}
            onChange={(e) => handleTextChange('sequenciaEsfoliacao', e.target.value)}
          />
        </fieldset>

        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Sequência de Erupção dos Permanentes
          </legend>
          <Textarea
            className='mt-2 min-h-[80px]'
            value={form.sequenciaErupcao ?? ''}
            onChange={(e) => handleTextChange('sequenciaErupcao', e.target.value)}
          />
        </fieldset>

        <fieldset className='rounded-lg border bg-card p-4'>
          <legend className='px-2 text-sm font-semibold text-primary'>
            Estágio de Calcificação de Nolla (Dente/Estágio)
          </legend>
          <Textarea
            className='mt-2 min-h-[80px]'
            value={form.estagioCalcificacao ?? ''}
            onChange={(e) => handleTextChange('estagioCalcificacao', e.target.value)}
          />
        </fieldset>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' size='sm'>
          Guardar Dentição Decídua e Mista
        </Button>
      </div>
    </form>
  )
}


