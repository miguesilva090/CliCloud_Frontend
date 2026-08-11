import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { toast } from '@/utils/toast-utils'
import { ReceitaLinhasInfarmedPanel } from './receita-linhas-infarmed-panel'
import { ReceitaJustificacaoQuantidadeDialog } from './receita-justificacao-quantidade-dialog'
import { formatEuro } from '../utils/calcular-totais-receita'
import {
  MSG_JAU,
  patchLimparJustificacao,
  requiresJustificacaoQuantidade,
} from '../utils/justificacao-quantidade'
import {
  linhaExigeMotivo,
  MOTIVOS_PRESCRICAO_NOME,
} from '../utils/motivo-prescricao-nome'
import {
  INDICACOES_TERAPEUTICAS,
  linhaExigeIndicacao,
} from '../utils/indicacao-terapeutica'

export type LinhaDraft = CreateReceitaLinhaRequest & {
  key: string
  /** Emb_unit legado — default false (limite 2) */
  embalagemUnitaria?: boolean
  /** default 1 (acute) */
  tipoTratamento?: number
}

type Props = {
  tipoReceita: number
  patologias?: string
  readOnly?: boolean
  linhas: LinhaDraft[]
  /** Deve devolver a key da linha criada */
  onAddLinha: (linha: CreateReceitaLinhaRequest) => string
  onAddLinhaManual: () => void
  onUpdateLinha: (key: string, patch: Partial<LinhaDraft>) => void
  onRemoveLinha: (key: string) => void
}

export function ReceitaTabMedicacao({
  tipoReceita,
  patologias,
  readOnly,
  linhas,
  onAddLinha,
  onAddLinhaManual,
  onUpdateLinha,
  onRemoveLinha,
}: Props) {
  const [jauKey, setJauKey] = useState<string | null>(null)

  const linhaJau = linhas.find((l) => l.key === jauKey) ?? null

  const openJau = (key: string, forceToastIfNotNeeded = false) => {
    const linha = linhas.find((l) => l.key === key)
    if (!linha) return
    if (!requiresJustificacaoQuantidade(linha)) {
      if (forceToastIfNotNeeded) toast.error(MSG_JAU.naoNecessaria)
      return
    }
    setJauKey(key)
  }

  const handleQuantidadeChange = (linha: LinhaDraft, raw: string) => {
    const quantidade = Number(raw) || 1
    const next = { ...linha, quantidade }
    const precisa = requiresJustificacaoQuantidade(next)

    if (!precisa && linha.codJustificacaoQuantidade) {
      onUpdateLinha(linha.key, {
        quantidade,
        ...patchLimparJustificacao(),
      })
      return
    }

    onUpdateLinha(linha.key, { quantidade })

    if (precisa && !linha.codJustificacaoQuantidade) {
      setJauKey(linha.key)
    }
  }

  const handleAddInfarmed = (linha: CreateReceitaLinhaRequest) => {
    const key = onAddLinha(linha)
    if (
      requiresJustificacaoQuantidade({
        ...linha,
        embalagemUnitaria: false,
        tipoTratamento: 1,
      })
    ) {
      queueMicrotask(() => setJauKey(key))
    }
  }

  return (
    <div className='space-y-4'>
      {!readOnly ? (
        <div className='space-y-2'>
          <h2 className='text-sm font-medium'>Pesquisar medicamentos</h2>
          <ReceitaLinhasInfarmedPanel
            tipoReceita={tipoReceita}
            patologias={patologias}
            disabled={readOnly}
            onAddLinha={handleAddInfarmed}
          />
        </div>
      ) : null}

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-sm font-medium'>Linhas da receita</h2>
          {!readOnly ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onAddLinhaManual}
            >
              <Plus className='mr-1 h-4 w-4' />
              Linha manual
            </Button>
          ) : null}
        </div>

        <div className='overflow-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designação</TableHead>
                <TableHead className='min-w-[220px]'>Motivo</TableHead>
                <TableHead className='min-w-[240px]'>Indicação</TableHead>
                <TableHead className='min-w-[180px]'>Diploma</TableHead>
                <TableHead className='w-[120px]'>Qtd</TableHead>
                <TableHead>Posologia</TableHead>
                <TableHead className='w-[90px]'>PVP</TableHead>
                <TableHead className='w-[110px]'>Compartic.</TableHead>
                <TableHead className='w-[90px]'>Utente</TableHead>
                <TableHead className='w-[50px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className='text-center text-sm text-muted-foreground'
                  >
                    Sem linhas.
                  </TableCell>
                </TableRow>
              ) : (
                linhas.map((l) => {
                  const exigeMotivo = linhaExigeMotivo(l)
                  const exigeIndicacao = linhaExigeIndicacao(l)
                  return (
                    <TableRow key={l.key}>
                      <TableCell>
                        <Input
                          value={l.designacao}
                          disabled={readOnly}
                          onChange={(e) =>
                            onUpdateLinha(l.key, {
                              designacao: e.target.value,
                            })
                          }
                        />
                        {l.codJustificacaoQuantidade ? (
                          <p className='mt-1 text-xs text-muted-foreground'>
                            JAU: {l.codJustificacaoQuantidade}
                            {l.justificacaoQuantidade
                              ? ` — ${l.justificacaoQuantidade}`
                              : ''}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {exigeMotivo ? (
                          <Select
                            value={
                              l.codMotivo != null && l.codMotivo > 0
                                ? String(l.codMotivo)
                                : undefined
                            }
                            disabled={readOnly}
                            onValueChange={(v) =>
                              onUpdateLinha(l.key, {
                                codMotivo: Number(v),
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Seleccionar motivo' />
                            </SelectTrigger>
                            <SelectContent>
                              {MOTIVOS_PRESCRICAO_NOME.map((m) => (
                                <SelectItem
                                  key={m.value}
                                  value={String(m.value)}
                                  className='text-xs'
                                >
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className='text-xs text-muted-foreground'>
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {exigeIndicacao ? (
                          <Select
                            value={
                              l.codIndicacaoTerapeutica != null &&
                              l.codIndicacaoTerapeutica > 0
                                ? String(l.codIndicacaoTerapeutica)
                                : undefined
                            }
                            disabled={readOnly}
                            onValueChange={(v) =>
                              onUpdateLinha(l.key, {
                                codIndicacaoTerapeutica: Number(v),
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Seleccione Indicação Terapeutica' />
                            </SelectTrigger>
                            <SelectContent>
                              {INDICACOES_TERAPEUTICAS.map((i) => (
                                <SelectItem
                                  key={i.value}
                                  value={String(i.value)}
                                  className='text-xs'
                                >
                                  {i.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className='text-xs text-muted-foreground'>
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className='line-clamp-2 text-xs text-muted-foreground'
                          title={l.diploma ?? undefined}
                        >
                          {l.diploma?.trim() ? l.diploma : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Input
                            type='number'
                            min={1}
                            value={l.quantidade}
                            disabled={readOnly}
                            onChange={(e) =>
                              handleQuantidadeChange(l, e.target.value)
                            }
                          />
                          {!readOnly ? (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              title='Justificação do ato único'
                              onClick={() => openJau(l.key, true)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={l.posologia ?? ''}
                          disabled={readOnly}
                          onChange={(e) =>
                            onUpdateLinha(l.key, {
                              posologia: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className='text-sm tabular-nums'>
                        {l.pvp != null ? formatEuro(l.pvp) : '—'}
                      </TableCell>
                      <TableCell className='text-sm tabular-nums'>
                        {l.comparticipacao != null
                          ? formatEuro(l.comparticipacao)
                          : '—'}
                      </TableCell>
                      <TableCell className='text-sm tabular-nums'>
                        {l.valorUtente != null
                          ? formatEuro(l.valorUtente)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {!readOnly ? (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => onRemoveLinha(l.key)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReceitaJustificacaoQuantidadeDialog
        open={Boolean(jauKey && linhaJau)}
        onOpenChange={(open) => {
          if (!open) setJauKey(null)
        }}
        embalagemUnitaria={linhaJau?.embalagemUnitaria}
        initialCodigo={linhaJau?.codJustificacaoQuantidade}
        initialOutro={linhaJau?.justificacaoQuantidade}
        onConfirm={(patch) => {
          if (!jauKey) return
          onUpdateLinha(jauKey, patch)
          setJauKey(null)
        }}
        onCancelResetQuantidade={(quantidade, patch) => {
          if (!jauKey) return
          onUpdateLinha(jauKey, { quantidade, ...patch })
          setJauKey(null)
        }}
      />
    </div>
  )
}
