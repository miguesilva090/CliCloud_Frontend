import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponseStatus } from '@/types/api/responses'
import {
  useMedicamentosPrescricaoByEmbId,
  useMedicamentosListagemResumo,
  usePrefetchMedicamentoPrescricao,
  usePrefetchPrimeirasLinhasPrescricao,
  medicamentosPrescricaoQueryKey,
} from '../queries/medicamentos-infarmed-queries'
import type { MedicamentoListagemResumoItemDto } from '@/types/dtos/prescricao/medicamentos-infarmed.dtos'
import { calcularTotaisLinha } from '../utils/calcular-totais-linha'

type ReceitaEletronicaPanelProps = {
  patologias?: string
  tipoReceita?: number
}

function ReceitaEletronicaPanel({
  patologias,
  tipoReceita = 1,
}: ReceitaEletronicaPanelProps) {
  const queryClient = useQueryClient()
  const prefetchPrescricao = usePrefetchMedicamentoPrescricao(patologias)

  const [search, setSearch] = useState('')
  const [searchD] = useDebounce(search, 400)
  const [selectedEmbId, setSelectedEmbId] = useState<string | null>(null)
  const [quantidade, setQuantidade] = useState(1)

  const listagemQuery = useMedicamentosListagemResumo(
    {
      nome: searchD,
      tipo: 10,
      page: 1,
      contar: false,
      tipoReceita,
      prescritivel: true,
    },
    searchD.trim().length >= 3
  )

  const items: MedicamentoListagemResumoItemDto[] = useMemo(() => {
    const envelope = listagemQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return []
    return envelope.data?.items ?? []
  }, [listagemQuery.data])

  const embIds = useMemo(() => items.map((i) => i.embId), [items])

  usePrefetchPrimeirasLinhasPrescricao(
    embIds,
    !listagemQuery.isFetching && embIds.length > 0,
    patologias,
    2
  )

  const prescricaoQuery = useMedicamentosPrescricaoByEmbId(
    selectedEmbId,
    patologias
  )

  const aCarregarPrescricao =
    prescricaoQuery.isFetching && !prescricaoQuery.data

  const listagemError =
    listagemQuery.data?.info?.status === ResponseStatus.Failure
      ? Object.values(listagemQuery.data.info.messages ?? {})
          .flat()
          .join(' ')
      : null

  const linha = useMemo(() => {
    const envelope = prescricaoQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return null
    return envelope.data ?? null
  }, [prescricaoQuery.data])

  const totais = useMemo(() => {
    if (!linha) return null
    return calcularTotaisLinha(linha, quantidade)
  }, [linha, quantidade])

  const linhaError =
    prescricaoQuery.data?.info?.status === ResponseStatus.Failure
      ? Object.values(prescricaoQuery.data.info.messages ?? {})
          .flat()
          .join(' ')
      : null

  const getLinhaEstado = (embId: string) => {
    const state = queryClient.getQueryState(
      medicamentosPrescricaoQueryKey(embId, patologias)
    )
    if (state?.status === 'success') return 'ready'
    if (state?.fetchStatus === 'fetching') return 'loading'
    return 'idle'
  }

  const handleClearSearch = () => {
    setSearch('')
    setSelectedEmbId(null)
    setQuantidade(1)
  }

  const handleSelectEmbalagem = (embId: string) => {
    setSelectedEmbId(embId)
    setQuantidade(1)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2 max-w-xl'>
        <Label htmlFor='pesquisa-medicamento'>Pesquisar medicamento</Label>
        <div className='flex gap-2'>
          <Input
            id='pesquisa-medicamento'
            placeholder='Mín. 3 caracteres (ex.: brufen)'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedEmbId(null)
              setQuantidade(1)
            }}
          />
          <Button
            type='button'
            variant='outline'
            onClick={handleClearSearch}
          >
            Limpar
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>
          Lista light Infarmed. Clique numa linha para carregar preços e
          comparticipação. As primeiras linhas pré-carregam em background.
        </p>
      </div>

      {searchD.trim().length > 0 && searchD.trim().length < 3 ? (
        <p className='text-sm text-muted-foreground'>
          Indique pelo menos 3 caracteres.
        </p>
      ) : null}

      {listagemQuery.isFetching ? (
        <p className='text-sm text-muted-foreground'>A pesquisar...</p>
      ) : null}

      {listagemError ? (
        <p className='text-sm text-destructive'>{listagemError}</p>
      ) : null}

      {items.length > 0 ? (
        <div className='rounded-md border overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dosagem</TableHead>
                <TableHead>Embalagem</TableHead>
                <TableHead>CNPEM</TableHead>
                <TableHead>Nº Registo</TableHead>
                <TableHead>Genérico</TableHead>
                <TableHead className='w-8' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const estado = getLinhaEstado(item.embId)
                return (
                  <TableRow
                    key={item.embId}
                    className={
                      selectedEmbId === item.embId
                        ? 'bg-accent cursor-pointer'
                        : 'cursor-pointer'
                    }
                    onMouseEnter={() => prefetchPrescricao(item.embId)}
                    onClick={() => handleSelectEmbalagem(item.embId)}
                  >
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.dosagem ?? '—'}</TableCell>
                    <TableCell>{item.embalagem ?? '—'}</TableCell>
                    <TableCell>{item.cnpem}</TableCell>
                    <TableCell>{item.nrRegisto ?? '—'}</TableCell>
                    <TableCell>{item.generico ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {estado === 'ready' ? '✓' : estado === 'loading' ? '…' : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {!listagemQuery.isFetching &&
      searchD.trim().length >= 3 &&
      items.length === 0 &&
      !listagemError ? (
        <p className='text-sm text-muted-foreground'>Sem resultados.</p>
      ) : null}

      {selectedEmbId ? (
        <div className='rounded-lg border bg-card p-4 space-y-3'>
          <h3 className='text-sm font-medium'>Linha de receita (Infarmed)</h3>

          <p className='text-xs text-muted-foreground'>
            Se a linha ainda não estiver pré-carregada, pode demorar 30–60
            segundos.
          </p>

          {aCarregarPrescricao ? (
            <p className='text-sm text-muted-foreground'>
              A carregar prescrição...
            </p>
          ) : null}

          {linhaError ? (
            <p className='text-sm text-destructive'>{linhaError}</p>
          ) : null}

          {linha ? (
            <>
              <div className='grid gap-2 text-sm sm:grid-cols-2'>
                <div>
                  <span className='text-muted-foreground'>Medicamento: </span>
                  {linha.nome} {linha.dosagem}
                </div>
                <div>
                  <span className='text-muted-foreground'>Embalagem: </span>
                  {linha.embalagem ?? '—'}
                </div>
                <div>
                  <span className='text-muted-foreground'>CNPEM: </span>
                  {linha.cnpem}
                </div>
                <div>
                  <span className='text-muted-foreground'>Nº Registo: </span>
                  {linha.nrRegisto ?? '—'}
                </div>
                <div>
                  <span className='text-muted-foreground'>PVP: </span>
                  {linha.precoPvp?.preco ?? linha.baseCalculo?.pvp ?? '—'} €
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    Comparticipação:{' '}
                  </span>
                  {linha.taxaComparticipacaoEfectiva ??
                    linha.baseCalculo?.taxaComparticipacao ??
                    '—'}
                  %
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    Prescritível amb.:{' '}
                  </span>
                  {linha.prescritivelAmbulatorio ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    Grupo homogéneo:{' '}
                  </span>
                  {linha.grupoHomogeneo ?? '—'}
                </div>
                {linha.opcoesEquivalentes?.length ? (
                  <div className='sm:col-span-2'>
                    <span className='text-muted-foreground'>Equivalentes: </span>
                    {linha.opcoesEquivalentes.length}
                  </div>
                ) : null}
              </div>

              <div className='flex flex-col gap-2 sm:flex-row sm:items-end pt-2 border-t'>
                <div className='flex flex-col gap-1'>
                  <Label htmlFor='quantidade-medicamento'>Quantidade</Label>
                  <Input
                    id='quantidade-medicamento'
                    type='number'
                    min={1}
                    className='w-24'
                    value={quantidade}
                    onChange={(e) =>
                      setQuantidade(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
              </div>

              {totais ? (
                <div className='grid gap-2 text-sm sm:grid-cols-2 pt-2 border-t'>
                  <div>
                    <span className='text-muted-foreground'>PVP unit.: </span>
                    {totais.pvp} €
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Taxa: </span>
                    {totais.taxaComparticipacao}%
                  </div>
                  <div>
                    <span className='text-muted-foreground'>PSNS unit.: </span>
                    {totais.psns} €
                  </div>
                  <div>
                    <span className='text-muted-foreground'>PUT unit.: </span>
                    {totais.put} €
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Total PSNS: </span>
                    {totais.totalPsns} €
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Total PUT: </span>
                    {totais.totalPut} €
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground pt-2 border-t'>
                  Sem preço PVP — totais não calculados.
                </p>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type MedicacaoTabProps = {
  patologiasInfarmed?: string
  tipoReceita?: number
}

export function MedicacaoTab({
  patologiasInfarmed,
  tipoReceita = 1,
}: MedicacaoTabProps = {}) {
  return (
    <Tabs defaultValue='receita-eletronica' className='flex flex-col gap-2'>
      <TabsList className='w-full justify-start bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='receita-eletronica' className='tabs-pill px-2 py-1'>
          Receita Eletrónica
        </TabsTrigger>
        <TabsTrigger value='receita-manual' className='tabs-pill px-2 py-1'>
          Receita Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value='receita-eletronica'
        className='mt-0 rounded-lg border bg-card p-4'
      >
        <ReceitaEletronicaPanel
          patologias={patologiasInfarmed}
          tipoReceita={tipoReceita}
        />
      </TabsContent>

      <TabsContent
        value='receita-manual'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        Receita Manual (a implementar).
      </TabsContent>
    </Tabs>
  )
}