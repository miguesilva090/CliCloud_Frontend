import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ResponseStatus } from '@/types/api/responses'
import {
  useMedicamentosListagemResumo,
  useMedicamentosPrescricaoByEmbId,
} from '@/pages/area-clinica/processo-clinico/atendimento/ficha-clinica/queries/medicamentos-infarmed-queries'
import { MedicamentosInfarmedService } from '@/lib/services/prescricao/medicamentos-infarmed-service'
import { calcularTotaisLinha } from '@/pages/area-clinica/processo-clinico/atendimento/ficha-clinica/utils/calcular-totais-linha'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import type {
  MedicamentoListagemResumoItemDto,
  MedicamentoPrescricaoOpcaoDto,
} from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'
import { toast } from '@/utils/toast-utils'
import {
  INFARMED_PESQUISA_MODOS,
  POSOLOGIA_DURACAO_UNIDADES,
  POSOLOGIA_FREQUENCIAS,
  POSOLOGIA_QUANTIDADE_UNIDADES,
  POSOLOGIA_TIPOS_FREQUENCIA,
  buildPosologiaDescricao,
  duracaoExigeValor,
  type InfarmedPesquisaModo,
} from '../utils/posologia-options'
import {
  listEquivalentesParaModal,
  shouldShowGenericosModal,
} from '../utils/genericos-equivalentes'
import { extrairDiplomaDePrescricao } from '../utils/diploma-despacho'
import {
  ReceitaGenericosDialog,
  type GenericosPending,
} from './receita-genericos-dialog'

type Props = {
  tipoReceita?: number
  patologias?: string
  disabled?: boolean
  onAddLinha: (linha: CreateReceitaLinhaRequest) => void
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((v) => (v ?? '').trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'pt')
  )
}

function ListBox({
  title,
  items,
  value,
  onChange,
  disabled,
  className,
}: {
  title: string
  items: string[]
  value: string | null
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className='border-b bg-muted/40 px-2 py-1 text-xs font-medium'>
        {title}
      </div>
      <div className='max-h-36 overflow-auto'>
        {items.length === 0 ? (
          <p className='px-2 py-3 text-xs text-muted-foreground'>—</p>
        ) : (
          items.map((item) => (
            <button
              key={item}
              type='button'
              disabled={disabled}
              className={cn(
                'block w-full truncate px-2 py-1 text-left text-xs hover:bg-accent',
                value === item && 'bg-primary/15 font-medium text-primary'
              )}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export function ReceitaLinhasInfarmedPanel({
  tipoReceita = 1,
  patologias,
  disabled,
  onAddLinha,
}: Props) {
  const [pesquisaModo, setPesquisaModo] =
    useState<InfarmedPesquisaModo>('medicamento')
  const [search, setSearch] = useState('')
  const [searchCommitted, setSearchCommitted] = useState('')
  const [searchD] = useDebounce(searchCommitted, 300)

  const [nomeSel, setNomeSel] = useState<string | null>(null)
  const [dciSel, setDciSel] = useState<string | null>(null)
  const [dosagemSel, setDosagemSel] = useState<string | null>(null)
  const [formaSel, setFormaSel] = useState<string | null>(null)
  const [dimensaoSel, setDimensaoSel] = useState<string | null>(null)

  const [qtdUnidade, setQtdUnidade] = useState('comprimido')
  const [qtdValor, setQtdValor] = useState('1')
  const [tipoFreq, setTipoFreq] = useState('1')
  const [frequencia, setFrequencia] = useState('3x24h')
  const [duracaoUnidade, setDuracaoUnidade] = useState('')
  const [duracaoValor, setDuracaoValor] = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [nEmbalagens, setNEmbalagens] = useState(1)
  const [genericosOpen, setGenericosOpen] = useState(false)
  const [genericosPending, setGenericosPending] =
    useState<GenericosPending | null>(null)
  const [loadingEquivalentes, setLoadingEquivalentes] = useState(false)

  const listagemParams = useMemo(
    () =>
      pesquisaModo === 'dci'
        ? {
            dci: searchD,
            tipo: 30,
            page: 1,
            contar: false,
            tipoReceita,
            prescritivel: true,
          }
        : {
            nome: searchD,
            tipo: 30,
            page: 1,
            contar: false,
            tipoReceita,
            prescritivel: true,
          },
    [pesquisaModo, searchD, tipoReceita]
  )

  const listagemQuery = useMedicamentosListagemResumo(
    listagemParams,
    searchD.trim().length >= 3
  )

  const items: MedicamentoListagemResumoItemDto[] = useMemo(() => {
    const envelope = listagemQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return []
    return envelope.data?.items ?? []
  }, [listagemQuery.data])

  const nomes = useMemo(
    () => uniqueSorted(items.map((i) => i.nome)),
    [items]
  )

  const itemsNome = useMemo(
    () => (nomeSel ? items.filter((i) => i.nome === nomeSel) : items),
    [items, nomeSel]
  )

  const dcis = useMemo(
    () => uniqueSorted(itemsNome.map((i) => i.principioActivo)),
    [itemsNome]
  )

  const itemsDci = useMemo(
    () =>
      dciSel
        ? itemsNome.filter((i) => (i.principioActivo ?? '') === dciSel)
        : itemsNome,
    [itemsNome, dciSel]
  )

  const dosagens = useMemo(
    () => uniqueSorted(itemsDci.map((i) => i.dosagem)),
    [itemsDci]
  )

  const itemsDosagem = useMemo(
    () =>
      dosagemSel
        ? itemsDci.filter((i) => (i.dosagem ?? '') === dosagemSel)
        : itemsDci,
    [itemsDci, dosagemSel]
  )

  const formas = useMemo(
    () => uniqueSorted(itemsDosagem.map((i) => i.formaFarmaceutica)),
    [itemsDosagem]
  )

  const itemsForma = useMemo(() => {
    if (formaSel) {
      return itemsDosagem.filter((i) => (i.formaFarmaceutica ?? '') === formaSel)
    }
    return itemsDosagem
  }, [itemsDosagem, formaSel])

  const dimensoes = useMemo(
    () => uniqueSorted(itemsForma.map((i) => i.embalagem)),
    [itemsForma]
  )

  const selectedItem = useMemo(() => {
    if (!dimensaoSel) return null
    return (
      itemsForma.find((i) => (i.embalagem ?? '') === dimensaoSel) ?? null
    )
  }, [itemsForma, dimensaoSel])

  const selectedEmbId = selectedItem?.embId ?? null

  const prescricaoQuery = useMedicamentosPrescricaoByEmbId(
    selectedEmbId,
    patologias
  )

  const linhaInfarmed = useMemo(() => {
    const envelope = prescricaoQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return null
    return envelope.data ?? null
  }, [prescricaoQuery.data])

  const totais = useMemo(() => {
    if (!linhaInfarmed) return null
    return calcularTotaisLinha(linhaInfarmed, nEmbalagens)
  }, [linhaInfarmed, nEmbalagens])

  const frequenciasFiltradas = useMemo(
    () => POSOLOGIA_FREQUENCIAS.filter((f) => f.tipo === tipoFreq),
    [tipoFreq]
  )

  useEffect(() => {
    if (!frequenciasFiltradas.some((f) => f.value === frequencia)) {
      setFrequencia(frequenciasFiltradas[0]?.value ?? '')
    }
  }, [frequenciasFiltradas, frequencia])

  const resetCascade = () => {
    setNomeSel(null)
    setDciSel(null)
    setDosagemSel(null)
    setFormaSel(null)
    setDimensaoSel(null)
  }

  const resetPosologia = () => {
    setQtdUnidade('comprimido')
    setQtdValor('1')
    setTipoFreq('1')
    setFrequencia('3x24h')
    setDuracaoUnidade('')
    setDuracaoValor('')
    setInstrucoes('')
    setNEmbalagens(1)
  }

  const validatePosologia = (): boolean => {
    if (!qtdUnidade || !qtdValor) {
      toast.error('Indique a posologia (Quantidade).', 'Validação')
      return false
    }
    if (!tipoFreq || !frequencia) {
      toast.error('Indique a posologia (Frequência).', 'Validação')
      return false
    }
    if (duracaoExigeValor(duracaoUnidade) && !duracaoValor) {
      toast.error('Indique a posologia (Duração Valor).', 'Validação')
      return false
    }
    return true
  }

  const buildLinhaRequest = (
    porDci: boolean
  ): CreateReceitaLinhaRequest | null => {
    if (!selectedItem) {
      toast.error('Seleccione medicamento, dosagem e embalagem.', 'Validação')
      return null
    }
    if (!validatePosologia()) return null

    const qtdLabel =
      POSOLOGIA_QUANTIDADE_UNIDADES.find((u) => u.value === qtdUnidade)
        ?.label ?? qtdUnidade
    const freqLabel =
      POSOLOGIA_FREQUENCIAS.find((f) => f.value === frequencia)?.label ??
      frequencia
    const durLabel =
      POSOLOGIA_DURACAO_UNIDADES.find((d) => d.value === duracaoUnidade)
        ?.label ?? ''

    const posologia = buildPosologiaDescricao({
      quantidadeValor: qtdValor,
      quantidadeUnidadeLabel: qtdLabel,
      frequenciaLabel: freqLabel,
      duracaoValor: duracaoValor || null,
      duracaoUnidadeLabel: durLabel || null,
      instrucoes,
    })

    const nome = selectedItem.nome?.trim() || ''
    const dosagem =
      selectedItem.dosagem?.trim() || linhaInfarmed?.dosagem?.trim() || ''
    const dci =
      selectedItem.principioActivo?.trim() ||
      linhaInfarmed?.principioActivo?.trim() ||
      ''

    const designacao = porDci
      ? [dci || nome, dosagem].filter(Boolean).join(' ')
      : dosagem
        ? `${nome} ${dosagem}`
        : nome

    return {
      ordem: 0,
      tipoLinha: tipoReceita,
      embId: selectedItem.embId,
      cnpem: selectedItem.cnpem ?? linhaInfarmed?.cnpem ?? null,
      designacao,
      descricaoEmbalagem:
        selectedItem.embalagem ?? linhaInfarmed?.embalagem ?? null,
      quantidade: nEmbalagens,
      pvp: totais?.pvp ?? null,
      comparticipacao: totais?.psns ?? null,
      valorUtente: totais?.put ?? null,
      posologia,
      posologiaQuantidadeUnidade: qtdUnidade,
      posologiaQuantidadeValor: qtdValor,
      posologiaFrequenciaUnidade: tipoFreq,
      posologiaFrequenciaValor: frequencia,
      posologiaDuracaoUnidade: duracaoUnidade || null,
      posologiaDuracaoValor: duracaoValor || null,
      posologiaInstrucoes: instrucoes.trim() || null,
      codValidade: 1,
      // 1 = marca · 2 = DCI (legado CodigoTipoPrescricao)
      codTipoPrescricao: porDci ? 2 : 1,
      codMotivo: null,
      codIndicacaoTerapeutica: null,
      diploma: extrairDiplomaDePrescricao(linhaInfarmed, porDci),
    }
  }

  const commitLinha = (linha: CreateReceitaLinhaRequest) => {
    onAddLinha(linha)
    setSearch('')
    setSearchCommitted('')
    resetCascade()
    resetPosologia()
  }

  const handleAdd = async (porDci: boolean) => {
    if (prescricaoQuery.isFetching || loadingEquivalentes) {
      toast.error(
        'Aguarde a obtenção dos preços antes de adicionar.',
        'Preços'
      )
      return
    }

    const linha = buildLinhaRequest(porDci)
    if (!linha) return

    if (linha.pvp == null) {
      toast.error(
        'O Infarmed não devolveu PVP para esta embalagem. A linha fica sem preço (totais a 0).',
        'Preços'
      )
    }

    // Adicionar por DCI → sem modal de genéricos
    if (porDci) {
      commitLinha(linha)
      return
    }

    const cnpem = linha.cnpem ?? undefined
    let opcoes: MedicamentoPrescricaoOpcaoDto[] =
      linhaInfarmed?.opcoesEquivalentes ?? []

    // Prescrição slim já não traz equivalentes (lento) — carrega só ao Adicionar.
    if (opcoes.length === 0 && cnpem) {
      setLoadingEquivalentes(true)
      try {
        const res = await MedicamentosInfarmedService().getEquivalentesByCnpem(
          cnpem,
          patologias
        )
        const envelope = res.info
        if (envelope?.status === ResponseStatus.Success && envelope.data) {
          opcoes = envelope.data
        }
      } catch {
        toast.error(
          'Não foi possível obter genéricos equivalentes. A linha será adicionada sem comparação.',
          'Genéricos'
        )
      } finally {
        setLoadingEquivalentes(false)
      }
    }

    if (!shouldShowGenericosModal(cnpem, opcoes)) {
      commitLinha(linha)
      return
    }

    const equivalentes = listEquivalentesParaModal(cnpem, opcoes)
    if (equivalentes.length === 0) {
      commitLinha(linha)
      return
    }

    setGenericosPending({
      linhaMarca: linha,
      resumo: {
        nome: selectedItem?.nome ?? linha.designacao,
        substancia:
          selectedItem?.principioActivo ?? linhaInfarmed?.principioActivo,
        embalagem: selectedItem?.embalagem ?? linhaInfarmed?.embalagem,
        forma: linhaInfarmed?.formaFarmaceutica,
        taxa: linhaInfarmed?.taxaComparticipacaoEfectiva ?? null,
        pvp: totais?.pvp ?? null,
        valorUtente: totais?.put ?? null,
      },
      equivalentes,
      patologias,
    })
    setGenericosOpen(true)
  }

  return (
    <div className='space-y-3 rounded-md border p-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-xs font-medium'>Pesquisar por</span>
        {INFARMED_PESQUISA_MODOS.map((t) => (
          <label
            key={t.value}
            className='flex items-center gap-1.5 text-xs'
          >
            <input
              type='radio'
              name='infarmed-pesquisa-modo'
              checked={pesquisaModo === t.value}
              disabled={disabled}
              onChange={() => {
                setPesquisaModo(t.value)
                resetCascade()
                setSearchCommitted('')
              }}
            />
            {t.label}
          </label>
        ))}
      </div>

      <div className='flex gap-2'>
        <Input
          className='h-8'
          placeholder='Mín. 3 caracteres'
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setSearchCommitted(search.trim())
              resetCascade()
            }
          }}
        />
        <Button
          type='button'
          size='sm'
          disabled={disabled || search.trim().length < 3}
          onClick={() => {
            setSearchCommitted(search.trim())
            resetCascade()
          }}
        >
          Pesquisar
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={disabled}
          onClick={() => {
            setSearch('')
            setSearchCommitted('')
            resetCascade()
            resetPosologia()
          }}
        >
          Limpar
        </Button>
      </div>

      {listagemQuery.isFetching ? (
        <p className='text-xs text-muted-foreground'>A pesquisar…</p>
      ) : null}

      {searchD.trim().length >= 3 ? (
        <div className='grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_1fr]'>
          <div className='overflow-hidden rounded-md border'>
            <ListBox
              title='Medicamento'
              items={nomes}
              value={nomeSel}
              disabled={disabled}
              onChange={(v) => {
                setNomeSel(v)
                setDciSel(null)
                setDosagemSel(null)
                setFormaSel(null)
                setDimensaoSel(null)
              }}
            />
          </div>
          <div className='grid grid-rows-2 gap-2'>
            <div className='overflow-hidden rounded-md border'>
              <ListBox
                title='Substância Activa DCI'
                items={dcis}
                value={dciSel}
                disabled={disabled || !nomeSel}
                onChange={(v) => {
                  setDciSel(v)
                  setDosagemSel(null)
                  setFormaSel(null)
                  setDimensaoSel(null)
                }}
              />
            </div>
            <div className='overflow-hidden rounded-md border'>
              <ListBox
                title='Dosagem'
                items={dosagens}
                value={dosagemSel}
                disabled={disabled || !nomeSel}
                onChange={(v) => {
                  setDosagemSel(v)
                  setFormaSel(null)
                  setDimensaoSel(null)
                }}
              />
            </div>
          </div>
          <div className='grid grid-rows-2 gap-2'>
            <div className='overflow-hidden rounded-md border'>
              <ListBox
                title='Forma Farmacêutica'
                items={formas}
                value={formaSel}
                disabled={disabled || !dosagemSel}
                onChange={(v) => {
                  setFormaSel(v)
                  setDimensaoSel(null)
                }}
              />
            </div>
            <div className='overflow-hidden rounded-md border'>
              <ListBox
                title='Dimensão'
                items={dimensoes}
                value={dimensaoSel}
                disabled={
                  disabled ||
                  !dosagemSel ||
                  (formas.length > 0 && !formaSel)
                }
                onChange={setDimensaoSel}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className='space-y-2 border-t pt-3'>
        <p className='text-xs font-medium'>Posologia</p>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-1'>
            <Label className='text-xs'>Unidade</Label>
            <Select
              value={qtdUnidade}
              disabled={disabled}
              onValueChange={setQtdUnidade}
            >
              <SelectTrigger className='h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSOLOGIA_QUANTIDADE_UNIDADES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Quant. (Valor)</Label>
            <Input
              className='h-8'
              type='number'
              min={0.01}
              step='0.01'
              value={qtdValor}
              disabled={disabled}
              onChange={(e) => setQtdValor(e.target.value)}
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Tipo de Frequência</Label>
            <Select
              value={tipoFreq}
              disabled={disabled}
              onValueChange={setTipoFreq}
            >
              <SelectTrigger className='h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSOLOGIA_TIPOS_FREQUENCIA.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Frequência</Label>
            <Select
              value={frequencia}
              disabled={disabled}
              onValueChange={setFrequencia}
            >
              <SelectTrigger className='h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequenciasFiltradas.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Duração (Unidade)</Label>
            <Select
              value={duracaoUnidade || '__none__'}
              disabled={disabled}
              onValueChange={(v) =>
                setDuracaoUnidade(v === '__none__' ? '' : v)
              }
            >
              <SelectTrigger className='h-8'>
                <SelectValue placeholder='—' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>—</SelectItem>
                {POSOLOGIA_DURACAO_UNIDADES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Duração (Valor)</Label>
            <Input
              className='h-8'
              type='number'
              min={1}
              value={duracaoValor}
              disabled={disabled || !duracaoExigeValor(duracaoUnidade)}
              onChange={(e) => setDuracaoValor(e.target.value)}
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Nº Embalagens</Label>
            <Input
              className='h-8'
              type='number'
              min={1}
              value={nEmbalagens}
              disabled={disabled}
              onChange={(e) => setNEmbalagens(Number(e.target.value) || 1)}
            />
          </div>
          <div className='space-y-1 sm:col-span-2 lg:col-span-1'>
            <Label className='text-xs'>Instruções</Label>
            <Textarea
              className='min-h-[32px]'
              rows={1}
              value={instrucoes}
              disabled={disabled}
              onChange={(e) => setInstrucoes(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2 pt-1'>
          {selectedItem && prescricaoQuery.isFetching ? (
            <span className='mr-auto text-xs text-muted-foreground'>
              A obter preços…
            </span>
          ) : null}
          {selectedItem && loadingEquivalentes ? (
            <span className='mr-auto text-xs text-muted-foreground'>
              A obter genéricos…
            </span>
          ) : null}
          {selectedItem &&
          !prescricaoQuery.isFetching &&
          !loadingEquivalentes &&
          linhaInfarmed &&
          !totais ? (
            <span className='mr-auto text-xs text-amber-600 dark:text-amber-400'>
              Infarmed sem PVP para esta embalagem
            </span>
          ) : null}
          {selectedItem && totais && !loadingEquivalentes ? (
            <span className='mr-auto text-xs tabular-nums text-muted-foreground'>
              PVP {totais.pvp.toFixed(2)} € · SNS {totais.psns.toFixed(2)} € ·
              Utente {totais.put.toFixed(2)} €
            </span>
          ) : null}
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={
              disabled ||
              !selectedItem ||
              prescricaoQuery.isFetching ||
              loadingEquivalentes
            }
            onClick={() => void handleAdd(true)}
          >
            Adicionar por DCI
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={
              disabled ||
              !selectedItem ||
              prescricaoQuery.isFetching ||
              loadingEquivalentes
            }
            onClick={() => void handleAdd(false)}
          >
            Adicionar
          </Button>
        </div>
      </div>

      <ReceitaGenericosDialog
        open={genericosOpen}
        pending={genericosPending}
        onOpenChange={(open) => {
          setGenericosOpen(open)
          if (!open) setGenericosPending(null)
        }}
        onManter={(linha) => commitLinha(linha)}
        onPrescrever={(linha) => commitLinha(linha)}
      />
    </div>
  )
}
