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
import { useGetUtente, useUtentesLight } from '@/pages/utentes/queries/utentes-queries'
import { buildUtenteOrganismoOptions } from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import type { OrganismoLightDTO } from '@/types/dtos/saude/organismos.dtos'
import type { DocumentoEditorState } from '../types/documento-editor.types'

const ID_FUNCIONALIDADE = 'documentos'
const ORG_NENHUM = '__nenhum__'

export function DocumentoTabClienteSection({
  state,
  onChange,
  clienteBloqueado,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
  clienteBloqueado: boolean
}) {
  const [utenteSearch, setUtenteSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [debUt] = useDebounce(utenteSearch, 300)
  const [debOrg] = useDebounce(orgSearch, 300)

  const utentesQ = useUtentesLight(debUt)
  const orgsQ = useQuery({
    queryKey: ['organismos', 'light', 'faturacao', debOrg],
    queryFn: () => OrganismoService(ID_FUNCIONALIDADE).getOrganismoLight(debOrg),
    enabled: state.tipoCliente === 'organismo',
  })

  const utenteDetalhe = useGetUtente(state.utenteId ?? '')

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
      })),
    [orgsQ.data],
  )

  const aplicarSnapshotUtente = async () => {
    const u = utenteDetalhe.data?.info?.data
    if (!u) return
    if (state.tipoCliente !== 'utente') return
    const codigoPostalTexto = await resolveCodigoPostalTexto(
      u.codigoPostalId,
      ID_FUNCIONALIDADE,
    )
    onChange({
      nomeCliente: u.nome ?? '',
      numeroContribuinteCliente: u.numeroContribuinte ?? '',
      moradaCliente: u.rua?.nome ?? '',
      localidadeCliente: u.freguesia?.nome ?? u.concelho?.nome ?? '',
      codigoPostalId: u.codigoPostalId ?? null,
      codigoPostalTexto,
    })
  }

  const aplicarSnapshotOrganismo = (organismoId: string) => {
    const fromUtente = organismoUtenteItems.find((o) => o.value === organismoId)
    if (fromUtente) {
      onChange({
        organismoId,
        nomeCliente: fromUtente.label,
      })
      return
    }
    const org = orgItemsGlobal.find((o) => o.value === organismoId)
    onChange({
      organismoId,
      nomeCliente: org?.label ?? state.nomeCliente,
    })
  }

  useEffect(() => {
    void aplicarSnapshotUtente()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot ao mudar utente / tipo
  }, [utenteDetalhe.data, state.tipoCliente, state.utenteId])

  useEffect(() => {
    if (state.tipoCliente !== 'organismo' || !state.organismoId) return
    aplicarSnapshotOrganismo(state.organismoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot organismo facturação
  }, [state.tipoCliente, state.organismoId, organismoUtenteItems, orgItemsGlobal])

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Facturar a</Label>
        <ToggleGroup
          type='single'
          value={state.tipoCliente}
          onValueChange={(v) => {
            if (v !== 'utente' && v !== 'organismo') return
            onChange({ tipoCliente: v })
            if (v === 'utente') {
              void aplicarSnapshotUtente()
            } else if (state.organismoId) {
              aplicarSnapshotOrganismo(state.organismoId)
            }
          }}
          disabled={clienteBloqueado}
        >
          <ToggleGroupItem value='utente'>Utente</ToggleGroupItem>
          <ToggleGroupItem value='organismo'>Organismo</ToggleGroupItem>
        </ToggleGroup>
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
          disabled={clienteBloqueado}
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
              if (id) aplicarSnapshotOrganismo(id)
            }}
            items={
              organismoUtenteItems.length > 0
                ? organismoUtenteItems
                : orgItemsGlobal
            }
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
          />
          {isConsumidorFinalNif(state.numeroContribuinteCliente) ? (
            <Badge variant='secondary'>Consumidor final</Badge>
          ) : null}
        </div>
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Código postal</Label>
        <Input
          className={inputClass}
          value={state.codigoPostalTexto}
          onChange={(e) => onChange({ codigoPostalTexto: e.target.value })}
          placeholder='0000-000'
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Global desde</Label>
        <Input
          type='date'
          className={inputClass}
          value={state.globalDesde}
          onChange={(e) => onChange({ globalDesde: e.target.value })}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Global até</Label>
        <Input
          type='date'
          className={inputClass}
          value={state.globalAte}
          onChange={(e) => onChange({ globalAte: e.target.value })}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>N.º sinistrado</Label>
        <Input
          className={inputClass}
          value={state.numeroSinistrado}
          onChange={(e) => onChange({ numeroSinistrado: e.target.value })}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Limite crédito</Label>
        <Input
          type='number'
          step={0.01}
          className={inputClass}
          value={state.limiteCredito ?? ''}
          onChange={(e) =>
            onChange({
              limiteCredito:
                e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </div>
      <div className={`md:col-span-2 ${fieldGap}`}>
        <Label className={labelClass}>Morada *</Label>
        <Input
          className={inputClass}
          value={state.moradaCliente}
          onChange={(e) => onChange({ moradaCliente: e.target.value })}
        />
      </div>
      <div className={fieldGap}>
        <Label className={labelClass}>Localidade</Label>
        <Input
          className={inputClass}
          value={state.localidadeCliente}
          onChange={(e) => onChange({ localidadeCliente: e.target.value })}
        />
      </div>
    </div>
  )
}
