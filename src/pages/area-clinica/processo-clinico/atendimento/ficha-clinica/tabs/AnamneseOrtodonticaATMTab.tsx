import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import {
  useCreateAnamneseOrtodonticaATM,
  useGetAnamneseOrtodonticaATMByUtente,
  useUpdateAnamneseOrtodonticaATM,
} from '../queries/anamnese-ortodontica-atm-queries'
import type {
  CreateAnamneseOrtodonticaATMRequest,
  UpdateAnamneseOrtodonticaATMRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-atm.dtos'

interface AnamneseOrtodonticaATMTabProps {
  utenteId: string
}

const initialForm: Omit<CreateAnamneseOrtodonticaATMRequest, 'utenteId'> = {
  palpacao: null,
  relacaoCentrica: null,
  lateralidadeEsquerda: null,
  lateralidadeDireita: null,
  protrusao: null,
  musculosMastigatorios: null,
  musculosInfra: null,
  musculosSupra: null,
  obs: null,
  apertaOuRangeDentes: null,
  musculosMandibulaDoridosAoAcordar: null,
  dorMandibulaOuvido: null,
  naoPodeAbrirFecharBoca: null,
  dentesSensiveisDesgastados: null,
  sofreuAlgumTraumatismo: null,
  senteBarulhoZumbido: null,
}

export function AnamneseOrtodonticaATMTab({
  utenteId,
}: AnamneseOrtodonticaATMTabProps) {
  const [form, setForm] =
    useState<Omit<CreateAnamneseOrtodonticaATMRequest, 'utenteId'>>(initialForm)

  const query = useGetAnamneseOrtodonticaATMByUtente(utenteId)
  const createMutation = useCreateAnamneseOrtodonticaATM(utenteId)
  const updateMutation = useUpdateAnamneseOrtodonticaATM(utenteId)

  const record = query.data

  useEffect(() => {
    if (record) {
      const {
        palpacao,
        relacaoCentrica,
        lateralidadeEsquerda,
        lateralidadeDireita,
        protrusao,
        musculosMastigatorios,
        musculosInfra,
        musculosSupra,
        obs,
        apertaOuRangeDentes,
        musculosMandibulaDoridosAoAcordar,
        dorMandibulaOuvido,
        naoPodeAbrirFecharBoca,
        dentesSensiveisDesgastados,
        sofreuAlgumTraumatismo,
        senteBarulhoZumbido,
      } = record

      setForm({
        palpacao,
        relacaoCentrica,
        lateralidadeEsquerda,
        lateralidadeDireita,
        protrusao,
        musculosMastigatorios,
        musculosInfra,
        musculosSupra,
        obs,
        apertaOuRangeDentes,
        musculosMandibulaDoridosAoAcordar,
        dorMandibulaOuvido,
        naoPodeAbrirFecharBoca,
        dentesSensiveisDesgastados,
        sofreuAlgumTraumatismo,
        senteBarulhoZumbido,
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

  const handleCheckboxChange = (field: keyof typeof form, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!record) {
        const payload: CreateAnamneseOrtodonticaATMRequest = {
          utenteId,
          ...form,
        }
        await createMutation.mutateAsync(payload)
        toast.success('ATM - Articulação Temporomandibular guardada com sucesso.')
      } else {
        const payload: UpdateAnamneseOrtodonticaATMRequest = {
          utenteId,
          ...form,
        }
        await updateMutation.mutateAsync({ id: record.id, data: payload })
        toast.success('ATM - Articulação Temporomandibular atualizada com sucesso.')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao guardar Anamnese Ortodôntica - ATM'
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <h3 className='text-sm font-semibold text-primary'>
        ATM - Articulação Temporomandibular
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-3'>
          <label className='flex flex-col gap-1 text-sm'>
            Palpação
            <Textarea
              className='min-h-[40px]'
              value={form.palpacao ?? ''}
              onChange={(e) => handleTextChange('palpacao', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            RC - Relação Cêntrica / OC - Oclusão Cêntrica
            <Textarea
              className='min-h-[40px]'
              value={form.relacaoCentrica ?? ''}
              onChange={(e) => handleTextChange('relacaoCentrica', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Lateralidade Esquerda
            <Textarea
              className='min-h-[40px]'
              value={form.lateralidadeEsquerda ?? ''}
              onChange={(e) =>
                handleTextChange('lateralidadeEsquerda', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Lateralidade Direita
            <Textarea
              className='min-h-[40px]'
              value={form.lateralidadeDireita ?? ''}
              onChange={(e) =>
                handleTextChange('lateralidadeDireita', e.target.value)
              }
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Protrusão
            <Textarea
              className='min-h-[40px]'
              value={form.protrusao ?? ''}
              onChange={(e) => handleTextChange('protrusao', e.target.value)}
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
            Músculos Infra-Hióideos
            <Textarea
              className='min-h-[40px]'
              value={form.musculosInfra ?? ''}
              onChange={(e) => handleTextChange('musculosInfra', e.target.value)}
            />
          </label>

          <label className='flex flex-col gap-1 text-sm'>
            Músculos Supra-Hióideos
            <Textarea
              className='min-h-[40px]'
              value={form.musculosSupra ?? ''}
              onChange={(e) => handleTextChange('musculosSupra', e.target.value)}
            />
          </label>
        </div>

        <div className='space-y-3'>
          <label className='flex flex-col gap-1 text-sm'>
            Observações
            <Textarea
              className='min-h-[200px]'
              value={form.obs ?? ''}
              onChange={(e) => handleTextChange('obs', e.target.value)}
            />
          </label>
        </div>
      </div>

      <fieldset className='rounded-lg border bg-card p-4'>
        <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.apertaOuRangeDentes}
            onCheckedChange={(v) =>
              handleCheckboxChange('apertaOuRangeDentes', v === true)
            }
          />
          <span>Aperta ou range os dentes?</span>
        </label>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.musculosMandibulaDoridosAoAcordar}
            onCheckedChange={(v) =>
              handleCheckboxChange(
                'musculosMandibulaDoridosAoAcordar',
                v === true,
              )
            }
          />
          <span>Quando acorda sente os músculos da mandíbula doridos?</span>
        </label>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.dorMandibulaOuvido}
            onCheckedChange={(v) =>
              handleCheckboxChange('dorMandibulaOuvido', v === true)
            }
          />
          <span>Tem dor na mandíbula, à volta, ou no próprio ouvido?</span>
        </label>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.naoPodeAbrirFecharBoca}
            onCheckedChange={(v) =>
              handleCheckboxChange('naoPodeAbrirFecharBoca', v === true)
            }
          />
          <span>
            Nota que não pode abrir e/ou fechar completamente a boca e que, ao tentar fazê-lo, dói?
          </span>
        </label>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.dentesSensiveisDesgastados}
            onCheckedChange={(v) =>
              handleCheckboxChange('dentesSensiveisDesgastados', v === true)
            }
          />
          <span>Nota os dentes sensíveis e/ou desgastados?</span>
        </label>
        <label className='flex items-start gap-2'>
          <Checkbox
            checked={!!form.sofreuAlgumTraumatismo}
            onCheckedChange={(v) =>
              handleCheckboxChange('sofreuAlgumTraumatismo', v === true)
            }
          />
          <span>
            Sofreu algum traumatismo na mandíbula ou tem artrite ou antecedentes?
          </span>
        </label>
        <label className='flex items-start gap-2 md:col-span-2'>
          <Checkbox
            checked={!!form.senteBarulhoZumbido}
            onCheckedChange={(v) =>
              handleCheckboxChange('senteBarulhoZumbido', v === true)
            }
          />
          <span>
            Sente barulho ou zumbido na articulação ao abrir e/ou fechar a boca?
          </span>
        </label>
        </div>
      </fieldset>

      <div className='flex justify-end'>
        <Button type='submit' size='sm'>
          Guardar ATM - Articulação Temporomandibular
        </Button>
      </div>
    </form>
  )
}


