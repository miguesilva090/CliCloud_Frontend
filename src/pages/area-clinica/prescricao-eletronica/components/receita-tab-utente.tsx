import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGetUtente } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utentes-queries'
import { ResponseStatus } from '@/types/api/responses'
import type { UtentePatologiaComparticipacaoDTO } from '@/types/dtos/prescricao/utente-patologia-comparticipacao.dtos'
import { toast } from '@/utils/toast-utils'
import { labelCondicaoSns } from '../utils/condicao-sns-options'
import { idadeFromNascimento } from '../utils/idade-from-nascimento'
import { formatPatologiasLabel } from '../utils/build-patologias-infarmed-param'
import { ReceitaPatologiasDialog } from './receita-patologias-dialog'

type Option = { value: string; label: string }

type Props = {
  utenteId: string
  onUtenteIdChange: (id: string) => void
  utenteOptions: Option[]
  utenteSearch: string
  onUtenteSearchChange: (v: string) => void
  utenteOptionsLoading?: boolean
  medicoNome: string
  observacoes: string
  onObservacoesChange: (v: string) => void
  numeroBeneficiarioEfr: string
  onNumeroBeneficiarioEfrChange: (v: string) => void
  onSiglaEfrChange: (v: string | null) => void
  patologias: UtentePatologiaComparticipacaoDTO[]
  onPatologiasChanged: () => void
  readOnly?: boolean
}

export function ReceitaTabUtente({
  utenteId,
  onUtenteIdChange,
  utenteOptions,
  utenteSearch,
  onUtenteSearchChange,
  utenteOptionsLoading,
  medicoNome,
  observacoes,
  onObservacoesChange,
  numeroBeneficiarioEfr,
  onNumeroBeneficiarioEfrChange,
  onSiglaEfrChange,
  patologias,
  onPatologiasChanged,
  readOnly,
}: Props) {
  const [patologiasOpen, setPatologiasOpen] = useState(false)
  const utenteQuery = useGetUtente(utenteId, Boolean(utenteId))

  const utente = useMemo(() => {
    const envelope = utenteQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return null
    return envelope.data ?? null
  }, [utenteQuery.data])

  useEffect(() => {
    if (!utente) {
      onSiglaEfrChange(null)
      return
    }
    onSiglaEfrChange(utente.organismo?.abreviatura ?? null)
    onNumeroBeneficiarioEfrChange(utente.numeroBeneficiarioEfr ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao mudar o utente carregado
  }, [utente?.id])

  const idade = idadeFromNascimento(utente?.dataNascimento)
  const efrNome =
    utente?.organismo?.nome ??
    utente?.organismo?.abreviatura ??
    '—'

  const openPatologias = () => {
    if (!utenteId) {
      toast.error('Seleccione o utente.')
      return
    }
    setPatologiasOpen(true)
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-12'>
        <div className='space-y-1 md:col-span-3'>
          <Label>
            N.º utente (SNS) <span className='text-destructive'>*</span>
          </Label>
          <Input
            className='h-8'
            value={utente?.numeroUtente ?? ''}
            readOnly
            placeholder='Seleccione o utente'
          />
        </div>
        <div className='space-y-1 md:col-span-9'>
          <Label>
            Nome do utente <span className='text-destructive'>*</span>
          </Label>
          <AsyncCombobox
            value={utenteId}
            onChange={onUtenteIdChange}
            items={utenteOptions}
            searchValue={utenteSearch}
            onSearchValueChange={onUtenteSearchChange}
            placeholder='Seleccionar utente...'
            disabled={readOnly}
            isLoading={utenteOptionsLoading || utenteQuery.isFetching}
          />
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-12'>
        <div className='space-y-1 md:col-span-3'>
          <Label>Idade</Label>
          <Input className='h-8' value={idade} readOnly />
        </div>
        <div className='space-y-1 md:col-span-9'>
          <div className='flex items-center justify-between gap-2'>
            <Label>Patologias</Label>
            {!readOnly ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-7'
                onClick={openPatologias}
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Editar
              </Button>
            ) : null}
          </div>
          <Textarea
            rows={2}
            value={formatPatologiasLabel(patologias)}
            readOnly
            placeholder='Sem patologias de comparticipação'
            className='resize-none'
          />
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <div className='space-y-1'>
          <Label>Centro de saúde</Label>
          <Input
            className='h-8'
            value={utente?.centroSaude?.nome ?? ''}
            readOnly
          />
        </div>
        <div className='space-y-1'>
          <Label>Profissão</Label>
          <Input
            className='h-8'
            value={utente?.profissao?.descricao ?? ''}
            readOnly
          />
        </div>
        <div className='space-y-1'>
          <Label>Médico</Label>
          <Input className='h-8' value={medicoNome} readOnly />
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <div className='space-y-1'>
          <Label>Condição</Label>
          <Input
            className='h-8'
            value={labelCondicaoSns(utente?.condicaoSns)}
            readOnly
          />
        </div>
        <div className='space-y-1'>
          <Label>Entidade financeira responsável</Label>
          <Input className='h-8' value={efrNome} readOnly />
        </div>
        <div className='space-y-1'>
          <Label>Número beneficiário</Label>
          <Input
            className='h-8'
            value={numeroBeneficiarioEfr}
            disabled={readOnly}
            onChange={(e) => onNumeroBeneficiarioEfrChange(e.target.value)}
          />
        </div>
      </div>

      <div className='space-y-1'>
        <Label>Observações</Label>
        <Textarea
          rows={3}
          value={observacoes}
          disabled={readOnly}
          onChange={(e) => onObservacoesChange(e.target.value)}
        />
      </div>

      {!readOnly ? (
        <ReceitaPatologiasDialog
          open={patologiasOpen}
          onOpenChange={setPatologiasOpen}
          utenteId={utenteId}
          initial={patologias}
          onSaved={onPatologiasChanged}
        />
      ) : null}
    </div>
  )
}
