import { useState } from 'react'
import { CalendarDays, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { modules } from '@/config/modules'
import { MedicacaoCronicaService } from '@/lib/services/prescricao/medicacao-cronica-service'
import { MedicacaoFavoritaService } from '@/lib/services/prescricao/medicacao-favorita-service'
import { ResponseStatus } from '@/types/api/responses'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { toast } from '@/utils/toast-utils'
import { ReceitaLinhasInfarmedPanel } from './receita-linhas-infarmed-panel'
import { ReceitaJustificacaoQuantidadeDialog } from './receita-justificacao-quantidade-dialog'
import { ReceitaLinhaEspecialDialog } from './receita-linha-especial-dialog'
import { ReceitaMedicacaoCronicaDialog } from './receita-medicacao-cronica-dialog'
import { ReceitaMedicacaoFavoritaDialog } from './receita-medicacao-favorita-dialog'
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
import {
  linhaPermiteGuardarCronica,
  mapLinhaToCreateCronica,
  MSG_MED_CRONICA,
  tipoReceitaPermiteCronica,
} from '../utils/medicacao-cronica'
import {
  linhaPermiteGuardarFavorito,
  mapLinhaToCreateFavorito,
  MSG_MED_FAVORITA,
  tipoReceitaPermiteFavorito,
} from '../utils/medicacao-favorita'
import { extractReceitaApiError } from '../utils/receita-api-error'
import { labelTipoLinha } from '../utils/tipo-linha-options'
import {
  tituloDialogoEspecial,
  usaLinhaEspecial,
  usaPainelInfarmed,
} from '../utils/receita-linha-especial'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export type LinhaDraft = CreateReceitaLinhaRequest & {
  key: string
  embalagemUnitaria?: boolean
  tipoTratamento?: number
}

type Props = {
  tipoReceita: number
  patologias?: string
  readOnly?: boolean
  utenteId?: string
  utenteCronico?: boolean
  medicoId?: string
  linhas: LinhaDraft[]
  onAddLinha: (linha: CreateReceitaLinhaRequest) => string
  onAddLinhaManual: () => void
  onUpdateLinha: (key: string, patch: Partial<LinhaDraft>) => void
  onRemoveLinha: (key: string) => void
}

export function ReceitaTabMedicacao({
  tipoReceita,
  patologias,
  readOnly,
  utenteId,
  utenteCronico,
  medicoId,
  linhas,
  onAddLinha,
  onAddLinhaManual,
  onUpdateLinha,
  onRemoveLinha,
}: Props) {
  const [jauKey, setJauKey] = useState<string | null>(null)
  const [especialOpen, setEspecialOpen] = useState(false)
  const [cronicaOpen, setCronicaOpen] = useState(false)
  const [favoritosOpen, setFavoritosOpen] = useState(false)

  const showInfarmed = usaPainelInfarmed(tipoReceita)
  const showEspecial = usaLinhaEspecial(tipoReceita)
  const showCronica =
    !readOnly &&
    Boolean(utenteId) &&
    utenteCronico === true &&
    tipoReceitaPermiteCronica(tipoReceita)
  const showFavoritos =
    !readOnly &&
    Boolean(medicoId) &&
    tipoReceitaPermiteFavorito(tipoReceita)
  const linhaJau = linhas.find((l) => l.key === jauKey) ?? null

  const openCronica = () => {
    if (!utenteId) {
      toast.error(MSG_MED_CRONICA.utenteMissing, 'Validação')
      return
    }
    if (!utenteCronico) {
      toast.error(MSG_MED_CRONICA.naoCronico, 'Validação')
      return
    }
    if (!tipoReceitaPermiteCronica(tipoReceita)) {
      toast.error(MSG_MED_CRONICA.tipoInvalido, 'Validação')
      return
    }
    setCronicaOpen(true)
  }

  const openFavoritos = () => {
    if (!medicoId) {
      toast.error(MSG_MED_FAVORITA.medicoMissing, 'Validação')
      return
    }
    if (!tipoReceitaPermiteFavorito(tipoReceita)) {
      toast.error(MSG_MED_FAVORITA.tipoInvalido, 'Validação')
      return
    }
    setFavoritosOpen(true)
  }

  const handleGuardarCronica = async (linha: LinhaDraft) => {
    if (!utenteId) {
      toast.error(MSG_MED_CRONICA.utenteMissing, 'Validação')
      return
    }
    if (!utenteCronico) {
      toast.error(MSG_MED_CRONICA.naoCronico, 'Validação')
      return
    }
    const payload = mapLinhaToCreateCronica(utenteId, linha)
    if ('error' in payload) {
      toast.error(payload.error, 'Validação')
      return
    }
    try {
      const res = await MedicacaoCronicaService(permissionId).create(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || MSG_MED_CRONICA.erro
        toast.error(msg)
        return
      }
      toast.success(MSG_MED_CRONICA.adicionada)
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, MSG_MED_CRONICA.erro))
    }
  }

  const handleGuardarFavorito = async (linha: LinhaDraft) => {
    if (!medicoId) {
      toast.error(MSG_MED_FAVORITA.medicoMissing, 'Validação')
      return
    }
    const payload = mapLinhaToCreateFavorito(medicoId, linha)
    if ('error' in payload) {
      toast.error(payload.error, 'Validação')
      return
    }
    try {
      const res = await MedicacaoFavoritaService(permissionId).create(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || MSG_MED_FAVORITA.erro
        toast.error(msg)
        return
      }
      toast.success(MSG_MED_FAVORITA.adicionada)
    } catch (err: unknown) {
      toast.error(extractReceitaApiError(err, MSG_MED_FAVORITA.erro))
    }
  }

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

  const afterAdd = (linha: CreateReceitaLinhaRequest) => {
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
      {!readOnly && showInfarmed ? (
        <div className='space-y-2'>
          <h2 className='text-sm font-medium'>Pesquisar medicamentos</h2>
          <ReceitaLinhasInfarmedPanel
            tipoReceita={tipoReceita}
            patologias={patologias}
            disabled={readOnly}
            onAddLinha={afterAdd}
          />
        </div>
      ) : null}

      {!readOnly && showEspecial ? (
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-sm text-muted-foreground'>
            Tipo actual: linha especial (texto livre). Catálogos LOUT/dietéticos
            ficam para P1.7b.
          </p>
          <Button
            type='button'
            size='sm'
            onClick={() => setEspecialOpen(true)}
          >
            <Plus className='mr-1 h-4 w-4' />
            {tituloDialogoEspecial(tipoReceita)}
          </Button>
        </div>
      ) : null}

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-sm font-medium'>Linhas da receita</h2>
          {!readOnly ? (
            <div className='flex flex-wrap gap-2'>
              {showFavoritos ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={openFavoritos}
                >
                  <Star className='mr-1 h-4 w-4' />
                  Favoritos
                </Button>
              ) : null}
              {showCronica || utenteCronico ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={openCronica}
                >
                  <CalendarDays className='mr-1 h-4 w-4' />
                  Medicação crónica
                </Button>
              ) : null}
              {showInfarmed ? (
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
          ) : null}
        </div>

        {linhas.length === 0 ? (
          <div className='rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground'>
            Sem linhas.
          </div>
        ) : (
          <div className='space-y-2.5'>
            {linhas.map((l, index) => {
              const exigeMotivo = linhaExigeMotivo(l)
              const exigeIndicacao = linhaExigeIndicacao(l)
              return (
                <div
                  key={l.key}
                  className='rounded-md border bg-card/40 px-3 py-2.5'
                >
                  {/* Linha 1: tipo + designação + qtd + acções */}
                  <div className='flex items-center gap-2'>
                    <span className='inline-flex h-8 w-10 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold'>
                      {labelTipoLinha(l.tipoLinha)}
                    </span>
                    <Input
                      className='h-8 min-w-0 flex-1 text-sm font-medium'
                      value={l.designacao}
                      disabled={readOnly}
                      onChange={(e) =>
                        onUpdateLinha(l.key, {
                          designacao: e.target.value,
                        })
                      }
                      aria-label={`Designação linha ${index + 1}`}
                    />
                    <Input
                      className='h-8 w-14 shrink-0 text-sm'
                      type='number'
                      min={1}
                      title='Quantidade'
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
                        className='h-8 w-8 shrink-0'
                        title='Justificação do ato único'
                        onClick={() => openJau(l.key, true)}
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                    ) : null}
                    {!readOnly ? (
                      <div className='flex shrink-0 items-center'>
                        {showCronica && linhaPermiteGuardarCronica(l) ? (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Guardar na medicação crónica'
                            onClick={() => void handleGuardarCronica(l)}
                          >
                            <CalendarDays className='h-3.5 w-3.5' />
                          </Button>
                        ) : null}
                        {showFavoritos && linhaPermiteGuardarFavorito(l) ? (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Adicionar aos favoritos'
                            onClick={() => void handleGuardarFavorito(l)}
                          >
                            <Star className='h-3.5 w-3.5' />
                          </Button>
                        ) : null}
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Remover linha'
                          onClick={() => onRemoveLinha(l.key)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Meta: embalagem / diploma / JAU */}
                  {l.descricaoEmbalagem ||
                  l.diploma?.trim() ||
                  l.codJustificacaoQuantidade ? (
                    <p className='mt-1.5 truncate pl-12 text-xs text-muted-foreground'>
                      {[
                        l.descricaoEmbalagem,
                        l.diploma?.trim()
                          ? `Diploma: ${l.diploma.trim()}`
                          : null,
                        l.codJustificacaoQuantidade
                          ? `JAU: ${l.codJustificacaoQuantidade}${
                              l.justificacaoQuantidade
                                ? ` — ${l.justificacaoQuantidade}`
                                : ''
                            }`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  ) : null}

                  {/* Linha 2: posologia + preços */}
                  <div className='mt-2 flex flex-wrap items-center gap-2 pl-12'>
                    <Input
                      className='h-8 min-w-[140px] flex-1 text-sm'
                      placeholder='Posologia'
                      value={l.posologia ?? ''}
                      disabled={readOnly || l.tipoLinha === 8}
                      onChange={(e) =>
                        onUpdateLinha(l.key, {
                          posologia: e.target.value,
                        })
                      }
                    />
                    <div className='flex shrink-0 items-center gap-2.5 rounded border bg-muted/30 px-2.5 py-1.5 text-xs tabular-nums'>
                      <span>
                        <span className='text-muted-foreground'>PVP </span>
                        {l.pvp != null ? formatEuro(l.pvp) : '—'}
                      </span>
                      <span className='text-muted-foreground'>·</span>
                      <span>
                        <span className='text-muted-foreground'>Comp. </span>
                        {l.comparticipacao != null
                          ? formatEuro(l.comparticipacao)
                          : '—'}
                      </span>
                      <span className='text-muted-foreground'>·</span>
                      <span>
                        <span className='text-muted-foreground'>Utente </span>
                        {l.valorUtente != null
                          ? formatEuro(l.valorUtente)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Motivo / Indicação só se necessários */}
                  {exigeMotivo || exigeIndicacao ? (
                    <div className='mt-2 grid gap-2 pl-12 sm:grid-cols-2'>
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
                            <SelectValue placeholder='Motivo' />
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
                      ) : null}
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
                            <SelectValue placeholder='Indicação' />
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
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
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

      <ReceitaLinhaEspecialDialog
        open={especialOpen}
        onOpenChange={setEspecialOpen}
        tipoLinha={tipoReceita}
        onConfirm={afterAdd}
      />

      {utenteId ? (
        <ReceitaMedicacaoCronicaDialog
          open={cronicaOpen}
          onOpenChange={setCronicaOpen}
          utenteId={utenteId}
          onAddLinha={afterAdd}
        />
      ) : null}

      {medicoId ? (
        <ReceitaMedicacaoFavoritaDialog
          open={favoritosOpen}
          onOpenChange={setFavoritosOpen}
          medicoId={medicoId}
          tipoLinha={
            tipoReceitaPermiteFavorito(tipoReceita) ? tipoReceita : undefined
          }
          onAddLinha={afterAdd}
        />
      ) : null}
    </div>
  )
}
