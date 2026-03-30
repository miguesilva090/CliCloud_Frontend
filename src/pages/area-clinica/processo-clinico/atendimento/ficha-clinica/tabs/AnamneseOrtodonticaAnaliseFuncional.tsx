import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast-utils'
import {
  useCreateAnamneseOrtodonticaAnaliseFuncional,
  useGetAnamneseOrtodonticaAnaliseFuncionalByUtente,
  useUpdateAnamneseOrtodonticaAnaliseFuncional,
} from '../queries/anamnese-ortodontica-analise-funcional-queries'
import type {
  CreateAnamneseOrtodonticaAnaliseFuncionalRequest,
  UpdateAnamneseOrtodonticaAnaliseFuncionalRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-funcional.dtos'

interface AnamneseOrtodonticaAnaliseFuncionalTabProps {
  utenteId: string
}

const initialForm: Omit<
  CreateAnamneseOrtodonticaAnaliseFuncionalRequest,
  'utenteId'
> = {
  labioSuperior: null,
  labioSuperiorTonicidade: null,
  labioInferior: null,
  labioInferiorTonicidade: null,
  aspetoLabioSuperiorInferior: null,
  linguaAspeto: null,
  linguaTonicidade: null,
  linguaPosicionamento: null,
  musculaturaFacial: null,
  musculaturaMentoniana: null,
  tipoRespiracao: null,
  forracao: null,
  mastigacao: null,
  musculosMastigatorios: null,
  comentariosAdicionais: null,
}

export function AnamneseOrtodonticaAnaliseFuncionalTab({
  utenteId,
}: AnamneseOrtodonticaAnaliseFuncionalTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOrtodonticaAnaliseFuncionalRequest, 'utenteId'>>(
      initialForm,
    )

  const query = useGetAnamneseOrtodonticaAnaliseFuncionalByUtente(utenteId)
  const createMutation = useCreateAnamneseOrtodonticaAnaliseFuncional(utenteId)
  const updateMutation = useUpdateAnamneseOrtodonticaAnaliseFuncional(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        labioSuperior,
        labioSuperiorTonicidade,
        labioInferior,
        labioInferiorTonicidade,
        aspetoLabioSuperiorInferior,
        linguaAspeto,
        linguaTonicidade,
        linguaPosicionamento,
        musculaturaFacial,
        musculaturaMentoniana,
        tipoRespiracao,
        forracao,
        mastigacao,
        musculosMastigatorios,
        comentariosAdicionais,
      } = record

      setForm({
        labioSuperior,
        labioSuperiorTonicidade,
        labioInferior,
        labioInferiorTonicidade,
        aspetoLabioSuperiorInferior,
        linguaAspeto,
        linguaTonicidade,
        linguaPosicionamento,
        musculaturaFacial,
        musculaturaMentoniana,
        tipoRespiracao,
        forracao,
        mastigacao,
        musculosMastigatorios,
        comentariosAdicionais,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!record) {
        const payload: CreateAnamneseOrtodonticaAnaliseFuncionalRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Análise Funcional ortodôntica guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOrtodonticaAnaliseFuncionalRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('Análise Funcional ortodôntica atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao guardar Anamnese Ortodôntica - Análise Funcional'
      toast.error(message)
    }
  }

  const loading = query.isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {loading && <p className='text-xs text-muted-foreground'>A carregar...</p>}

      <h3 className='text-sm font-semibold text-primary'>Análise Funcional</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <label className='flex flex-col gap-1 text-sm'>
          Lábio Superior (Aspeto)
          <Textarea
            className='min-h-[40px]'
            value={form.labioSuperior ?? ''}
            onChange={(e) => handleTextChange('labioSuperior', e.target.value)}
          />
        </label>
        <label className='flex flex-col gap-1 text-sm'>
          Tonicidade
          <Textarea
            className='min-h-[40px]'
            value={form.labioSuperiorTonicidade ?? ''}
            onChange={(e) =>
              handleTextChange('labioSuperiorTonicidade', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Lábio Inferior (Aspeto)
          <Textarea
            className='min-h-[40px]'
            value={form.labioInferior ?? ''}
            onChange={(e) => handleTextChange('labioInferior', e.target.value)}
          />
        </label>
        <label className='flex flex-col gap-1 text-sm'>
          Tonicidade
          <Textarea
            className='min-h-[40px]'
            value={form.labioInferiorTonicidade ?? ''}
            onChange={(e) =>
              handleTextChange('labioInferiorTonicidade', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm md:col-span-2'>
          Lábio Superior/Inferior (Aspeto)
          <Textarea
            className='min-h-[40px]'
            value={form.aspetoLabioSuperiorInferior ?? ''}
            onChange={(e) =>
              handleTextChange('aspetoLabioSuperiorInferior', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Língua (Aspeto)
          <Textarea
            className='min-h-[40px]'
            value={form.linguaAspeto ?? ''}
            onChange={(e) => handleTextChange('linguaAspeto', e.target.value)}
          />
        </label>
        <label className='flex flex-col gap-1 text-sm'>
          Tonicidade
          <Textarea
            className='min-h-[40px]'
            value={form.linguaTonicidade ?? ''}
            onChange={(e) => handleTextChange('linguaTonicidade', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm md:col-span-2'>
          Língua (Posicionamento)
          <Textarea
            className='min-h-[40px]'
            value={form.linguaPosicionamento ?? ''}
            onChange={(e) =>
              handleTextChange('linguaPosicionamento', e.target.value)
            }
          />
        </label>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        <label className='flex flex-col gap-1 text-sm'>
          Musculatura Facial
          <Textarea
            className='min-h-[40px]'
            value={form.musculaturaFacial ?? ''}
            onChange={(e) =>
              handleTextChange('musculaturaFacial', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Musculatura Mentoniana
          <Textarea
            className='min-h-[40px]'
            value={form.musculaturaMentoniana ?? ''}
            onChange={(e) =>
              handleTextChange('musculaturaMentoniana', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Respiração (Tipo)
          <Textarea
            className='min-h-[40px]'
            value={form.tipoRespiracao ?? ''}
            onChange={(e) => handleTextChange('tipoRespiracao', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Forragem
          <Textarea
            className='min-h-[40px]'
            value={form.forracao ?? ''}
            onChange={(e) => handleTextChange('forracao', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Mastigação
          <Textarea
            className='min-h-[40px]'
            value={form.mastigacao ?? ''}
            onChange={(e) => handleTextChange('mastigacao', e.target.value)}
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Músculos Mastigatórios
          <Textarea
            className='min-h-[40px]'
            value={form.musculosMastigatorios ?? ''}
            onChange={(e) =>
              handleTextChange('musculosMastigatorios', e.target.value)
            }
          />
        </label>

        <label className='flex flex-col gap-1 text-sm'>
          Comentários Adicionais
          <Textarea
            className='min-h-[40px]'
            value={form.comentariosAdicionais ?? ''}
            onChange={(e) =>
              handleTextChange('comentariosAdicionais', e.target.value)
            }
          />
        </label>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' size='sm' disabled={loading}>
          Guardar Análise Funcional
        </Button>
      </div>
    </form>
  )
}


