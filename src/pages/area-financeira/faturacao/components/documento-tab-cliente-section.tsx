import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import {
  isConsumidorFinalNif,
  resolveCodigoPostalTexto,
} from '../utils/documento-cliente-utils'
import {
  fieldGap,
  inputClass,
  labelClass,
  selectTriggerClass,
} from '@/lib/form-styles'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { useCodigosPostaisLight } from '@/hooks/lookups/use-utility-lookups'
import { useGetUtente, useUtentesLight } from '@/pages/area-comum/tabelas/entidades/utentes/queries/utentes-queries'
import {
  buildUtenteOrganismoOptions,
  resolveBeneficiarioApolice,
} from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import type { FicheiroEletronicoSiglaSlug } from '@/pages/area-financeira/ficheiros-eletronicos/constants/ficheiro-eletronico-siglas'
import { toast } from '@/utils/toast-utils'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import {
  mergePatchComRestricaoDescontos,
  organismoRestringeDescontos,
  organismoRestringeDescontosPorSiglaFicheiro,
} from '../utils/organismo-desconto-utils'
import { ResponseStatus } from '@/types/api/responses'
import type { OrganismoDTO, OrganismoLightDTO } from '@/types/dtos/saude/organismos.dtos'

const ID_FUNCIONALIDADE = 'documentos'
const ORG_NENHUM = '__nenhum__'

function buildMoradaOrganismo(org: OrganismoDTO): string {
  const rua = org.rua?.nome?.trim() ?? ''
  const porta = org.numeroPorta?.trim()
  if (rua && porta) return `${rua}, ${porta}`
  return rua
}

export function DocumentoTabClienteSection({
  state,
  onChange,
  clienteBloqueado,
  contextoFicheiroEletronicoSiglaSlug,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
  clienteBloqueado: boolean
  contextoFicheiroEletronicoSiglaSlug?: FicheiroEletronicoSiglaSlug | null
}) {
  const [utenteSearch, setUtenteSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [cpSearch, setCpSearch] = useState(state.codigoPostalTexto)
  const [debUt] = useDebounce(utenteSearch, 300)
  const [debOrg] = useDebounce(orgSearch, 300)
  const [debCp] = useDebounce(cpSearch, 300)

  const lookupsAtivos = !clienteBloqueado

  const utentesQ = useUtentesLight(debUt, lookupsAtivos)
  const orgsQ = useQuery({
    queryKey: [
      'organismos',
      'light',
      'faturacao',
      debOrg,
      contextoFicheiroEletronicoSiglaSlug ?? '',
    ],
    queryFn: () =>
      OrganismoService(ID_FUNCIONALIDADE).getOrganismoLight(
        debOrg,
        contextoFicheiroEletronicoSiglaSlug ?? undefined,
      ),
    enabled:
      lookupsAtivos &&
      (state.tipoCliente === 'organismo' || !!contextoFicheiroEletronicoSiglaSlug),
  })
  const codigosPostaisQ = useCodigosPostaisLight(debCp, lookupsAtivos)

  const utenteDetalhe = useGetUtente(state.utenteId ?? '', lookupsAtivos)

  const organismoUtenteItems = useMemo(() => {
    const u = utenteDetalhe.data?.info?.data
    return buildUtenteOrganismoOptions(u ?? null)
  }, [utenteDetalhe.data])

  const utenteItems = useMemo(
    () =>
      (utentesQ.data?.info?.data ?? []).map((u) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroContribuinte ?? undefined,
      })),
    [utentesQ.data],
  )

  const orgItemsGlobal = useMemo(
    () =>
      ((orgsQ.data?.info?.data ?? []) as OrganismoLightDTO[]).map((o) => ({
        value: o.id,
        label: o.nome ?? o.abreviatura ?? o.id,
        secondary: o.numeroContribuinte ?? undefined,
      })),
    [orgsQ.data],
  )

  const cpItems = useMemo(
    () =>
      (codigosPostaisQ.data?.info?.data ?? []).map((c) => ({
        value: c.id,
        label: c.codigo?.trim() ?? c.id,
        secondary: c.localidade ?? undefined,
      })),
    [codigosPostaisQ.data],
  )

  const aplicarBeneficiario = (utenteId: string | null, organismoId: string | null) => {
    const u = utenteDetalhe.data?.info?.data
    if (!u || !utenteId) {
      onChange({ beneficiario: '' })
      return
    }
    const { beneficiario } = resolveBeneficiarioApolice(u, organismoId ?? undefined)
    onChange({ beneficiario })
  }

  const aplicarSnapshotUtente = async () => {
    const u = utenteDetalhe.data?.info?.data
    if (!u || state.tipoCliente !== 'utente') return
    const cpLabel = await resolveCodigoPostalTexto(
      u.codigoPostalId,
      ID_FUNCIONALIDADE,
    )
    const { beneficiario } = resolveBeneficiarioApolice(
      u,
      state.organismoId ?? undefined,
    )
    onChange({
      nomeCliente: u.nome ?? '',
      numeroContribuinteCliente: u.numeroContribuinte ?? '',
      moradaCliente: u.rua?.nome ?? '',
      localidadeCliente: u.freguesia?.nome ?? u.concelho?.nome ?? '',
      codigoPostalId: u.codigoPostalId ?? null,
      codigoPostalTexto: cpLabel,
      beneficiario,
      limiteCreditoExibicao: '',
      organismoRestringeDescontos: false,
    })
    setCpSearch(cpLabel)
  }

  const aplicarSnapshotOrganismoLight = (organismoId: string) => {
    const orgDto = ((orgsQ.data?.info?.data ?? []) as OrganismoLightDTO[]).find(
      (o) => o.id === organismoId,
    )
    const orgItem = orgItemsGlobal.find((o) => o.value === organismoId)
    const restringe = organismoRestringeDescontosPorSiglaFicheiro(
      contextoFicheiroEletronicoSiglaSlug,
    )
    onChange(
      mergePatchComRestricaoDescontos(state, {
        organismoId,
        nomeCliente: orgDto?.nome ?? orgItem?.label ?? state.nomeCliente,
        numeroContribuinteCliente: orgDto?.numeroContribuinte ?? '',
        beneficiario: '',
        organismoRestringeDescontos: restringe,
      }),
    )
  }

  const aplicarSnapshotOrganismo = async (organismoId: string) => {
    const fromUtente = organismoUtenteItems.find((o) => o.value === organismoId)
    if (fromUtente) {
      onChange({
        organismoId,
        nomeCliente: fromUtente.label,
        organismoRestringeDescontos: false,
      })
      aplicarBeneficiario(state.utenteId, organismoId)
      return
    }

    try {
      const res = await OrganismoService(ID_FUNCIONALIDADE).getOrganismo(organismoId)
      const org =
        res.info?.status === ResponseStatus.Success ? res.info.data : null

      if (org) {
        const cpLabel =
          org.codigoPostal?.codigo?.trim() ??
          (await resolveCodigoPostalTexto(org.codigoPostalId, ID_FUNCIONALIDADE))

        const restringe = organismoRestringeDescontos(org)
        onChange(
          mergePatchComRestricaoDescontos(state, {
            organismoId,
            nomeCliente: org.nome ?? '',
            numeroContribuinteCliente: org.numeroContribuinte ?? '',
            moradaCliente: buildMoradaOrganismo(org),
            localidadeCliente: org.codigoPostal?.localidade?.trim() ?? '',
            codigoPostalId: org.codigoPostalId ?? null,
            codigoPostalTexto: cpLabel,
            beneficiario: '',
            organismoRestringeDescontos: restringe,
          }),
        )
        setCpSearch(cpLabel)
        return
      }
    } catch {
      aplicarSnapshotOrganismoLight(organismoId)
      return
    }

    aplicarSnapshotOrganismoLight(organismoId)
  }

  useEffect(() => {
    if (clienteBloqueado) return
    void aplicarSnapshotUtente()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot ao mudar utente
  }, [clienteBloqueado, utenteDetalhe.data, state.tipoCliente, state.utenteId, state.organismoId])

  useEffect(() => {
    if (clienteBloqueado) return
    if (state.tipoCliente !== 'organismo' || !state.organismoId) return
    void aplicarSnapshotOrganismo(state.organismoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot organismo
  }, [clienteBloqueado, state.tipoCliente, state.organismoId, organismoUtenteItems, orgItemsGlobal])

  useEffect(() => {
    if (!contextoFicheiroEletronicoSiglaSlug) return
    if (state.tipoCliente === 'organismo') return

    onChange({
      tipoCliente: 'organismo',
      utenteId: null,
      organismoId: null,
      beneficiario: '',
      nomeCliente: '',
      moradaCliente: '',
      localidadeCliente: '',
      numeroContribuinteCliente: '',
      codigoPostalId: null,
      codigoPostalTexto: '',
      limiteCreditoExibicao: '',
      organismoRestringeDescontos: false,
    })
    setCpSearch('')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- forçar organismo no contexto FE
  }, [contextoFicheiroEletronicoSiglaSlug])

  useEffect(() => {
    if (clienteBloqueado) return
    if (!contextoFicheiroEletronicoSiglaSlug || state.organismoId) return
    if (state.tipoCliente !== 'organismo') return
    if (orgsQ.isFetching) return

    if (orgItemsGlobal.length === 0) {
      if (orgsQ.isSuccess) {
        toast.error(
          'Nenhum organismo com a flag desta sigla. Verifique o registo em Tabelas → Organismos.',
        )
      }
      return
    }

    void aplicarSnapshotOrganismo(orgItemsGlobal[0].value)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-seleção organismo FE
  }, [
    clienteBloqueado,
    contextoFicheiroEletronicoSiglaSlug,
    state.organismoId,
    state.tipoCliente,
    orgItemsGlobal,
    orgsQ.isFetching,
    orgsQ.isSuccess,
  ])

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Facturar a</Label>
        <ToggleGroup
          type='single'
          value={state.tipoCliente}
          onValueChange={(v) => {
            if (contextoFicheiroEletronicoSiglaSlug) return
            if (v !== 'utente' && v !== 'organismo') return
            if (v === 'organismo') {
              onChange({
                tipoCliente: v,
                utenteId: null,
                organismoId: null,
                beneficiario: '',
                nomeCliente: '',
                moradaCliente: '',
                localidadeCliente: '',
                numeroContribuinteCliente: '',
                codigoPostalId: null,
                codigoPostalTexto: '',
                limiteCreditoExibicao: '',
                organismoRestringeDescontos: false,
              })
              setCpSearch('')
              return
            }
            onChange({
              tipoCliente: v,
              organismoId: null,
              beneficiario: '',
              nomeCliente: '',
              moradaCliente: '',
              localidadeCliente: '',
              numeroContribuinteCliente: '',
              codigoPostalId: null,
              codigoPostalTexto: '',
              limiteCreditoExibicao: '',
              organismoRestringeDescontos: false,
            })
            setCpSearch('')
          }}
          disabled={clienteBloqueado || !!contextoFicheiroEletronicoSiglaSlug}
        >
          <ToggleGroupItem
            value='utente'
            disabled={!!contextoFicheiroEletronicoSiglaSlug}
          >
            Utente
          </ToggleGroupItem>
          <ToggleGroupItem value='organismo'>Organismo</ToggleGroupItem>
        </ToggleGroup>
        {contextoFicheiroEletronicoSiglaSlug ? (
          <p className='text-xs text-muted-foreground'>
            Contexto Ficheiro Eletrónico — apenas organismos com a flag desta sigla.
          </p>
        ) : null}
      </div>

      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Utente</Label>
        <AsyncCombobox
          value={state.utenteId ?? ''}
          onChange={(id) => {
            onChange({
              utenteId: id || null,
              organismoId: id ? state.organismoId : null,
            })
          }}
          items={utenteItems}
          isLoading={utentesQ.isFetching}
          placeholder='Pesquisar utente…'
          searchValue={utenteSearch}
          onSearchValueChange={setUtenteSearch}
          disabled={clienteBloqueado || state.tipoCliente === 'organismo'}
        />
      </div>

      {state.tipoCliente === 'utente' ? (
        <div className={`md:col-span-2 ${fieldGap}`}>
          <Label className={labelClass}>Organismo (subsistema)</Label>
          <Select
            value={state.organismoId ?? ORG_NENHUM}
            onValueChange={(v) => {
              if (v === ORG_NENHUM) {
                onChange({ organismoId: null })
                void aplicarSnapshotUtente()
                return
              }
              onChange({ organismoId: v })
              aplicarBeneficiario(state.utenteId, v)
            }}
            disabled={clienteBloqueado || !state.utenteId}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder='Opcional…' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ORG_NENHUM}>— Sem organismo —</SelectItem>
              {organismoUtenteItems.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className={`md:col-span-2 ${fieldGap}`}>
          <Label className={labelClass}>Organismo (cliente)</Label>
          <AsyncCombobox
            value={state.organismoId ?? ''}
            onChange={(id) => {
              onChange({ organismoId: id || null })
              if (id) void aplicarSnapshotOrganismo(id)
            }}
            items={orgItemsGlobal}
            isLoading={orgsQ.isFetching}
            placeholder='Pesquisar organismo…'
            searchValue={orgSearch}
            onSearchValueChange={setOrgSearch}
            disabled={clienteBloqueado}
          />
        </div>
      )}

      <div className={fieldGap}>
        <Label className={labelClass}>Nome cliente *</Label>
        <Input
          className={inputClass}
          value={state.nomeCliente}
          onChange={(e) => onChange({ nomeCliente: e.target.value })}
          readOnly={clienteBloqueado}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Contribuinte</Label>
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            className={inputClass}
            value={state.numeroContribuinteCliente}
            onChange={(e) =>
              onChange({ numeroContribuinteCliente: e.target.value })
            }
            readOnly={clienteBloqueado}
          />
          {isConsumidorFinalNif(state.numeroContribuinteCliente) ? (
            <Badge variant='secondary'>Consumidor final</Badge>
          ) : null}
        </div>
      </div>

      <div className={fieldGap}>
        <Label className={labelClass}>Beneficiário</Label>
        <Input
          className={inputClass}
          readOnly
          value={state.beneficiario}
          title='Legado: modFldBeneficiario (readonly)'
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Limite crédito</Label>
        <Input
          className={inputClass}
          readOnly
          value={state.limiteCreditoExibicao || '—'}
          title='Legado: modFldLimiteCredito (plafond utente)'
        />
      </div>

      <div className={fieldGap}>
        <Label className={labelClass}>Código postal</Label>
        <AsyncCombobox
          value={state.codigoPostalId ?? ''}
          onChange={(id) => {
            const item = cpItems.find((c) => c.value === id)
            onChange({
              codigoPostalId: id || null,
              codigoPostalTexto: item?.label ?? state.codigoPostalTexto,
            })
            if (item?.label) setCpSearch(item.label)
          }}
          items={cpItems}
          isLoading={codigosPostaisQ.isFetching}
          placeholder='0000-000…'
          searchValue={cpSearch}
          onSearchValueChange={setCpSearch}
          disabled={clienteBloqueado}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Localidade</Label>
        <Input
          className={inputClass}
          value={state.localidadeCliente}
          onChange={(e) => onChange({ localidadeCliente: e.target.value })}
          readOnly={clienteBloqueado}
        />
      </div>

      <div className={fieldGap}>
        <Label className={labelClass}>Fatura global desde</Label>
        <Input
          className={inputClass}
          readOnly
          value={state.faturaGlobalDesde || '—'}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Fatura global até</Label>
        <Input
          className={inputClass}
          readOnly
          value={state.faturaGlobalAte || '—'}
        />
      </div>

      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Morada *</Label>
        <Input
          className={inputClass}
          value={state.moradaCliente}
          onChange={(e) => onChange({ moradaCliente: e.target.value })}
          readOnly={clienteBloqueado}
        />
      </div>
    </div>
  )
}
