import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import type { PaginatedResponse } from '@/types/api/responses'
import { SinistradoService } from '@/lib/services/sinistrados/sinistrado-service'
import type { SinistradoTableDTO } from '@/types/dtos/sinistrados/sinistrado.dtos'
import type { SinistradosInfoFaturacaoResponse } from '@/types/dtos/faturacao/documento-emissao.dtos'
import {
  useClinicaFaturacaoConfig,
  useSinistradosInfoFaturacaoMutation,
} from '../queries/documento-editor-queries'

const ID = 'documentos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (data: SinistradosInfoFaturacaoResponse) => void
}

export function DocumentoSinistradosInfoDialog({
  open,
  onOpenChange,
  onApply,
}: Props) {
  const [sinistradoId, setSinistradoId] = useState('')
  const [sinistradoLabel, setSinistradoLabel] = useState('')
  const [sinistradoSearch, setSinistradoSearch] = useState('')
  const [dataDesde, setDataDesde] = useState('')
  const [dataAte, setDataAte] = useState('')

  const authClientId = useAuthStore((s) => s.clientId)
  const clinicaConfigQ = useClinicaFaturacaoConfig()
  const clinicaId = clinicaConfigQ.data?.clinicaId || authClientId
  const clinicaNome = clinicaConfigQ.data?.clinicaNome

  const sinistradosQ = useQuery({
    queryKey: ['documento-editor', 'sinistrados-light', sinistradoSearch],
    queryFn: async () => {
      const filters: Array<{ id: string; value: string }> = [
        { id: 'historico', value: 'false' },
      ]
      if (sinistradoSearch.trim()) {
        filters.push({ id: 'codigosinistro', value: sinistradoSearch.trim() })
      }
      const res = await SinistradoService(ID).getPaginated({
        pageNumber: 1,
        pageSize: 25,
        filters,
        sorting: [{ id: 'createdOn', desc: true }],
      })
      const payload = res.info as PaginatedResponse<SinistradoTableDTO> | undefined
      return payload?.data ?? []
    },
    enabled: open,
    staleTime: 30_000,
  })

  const sinistradoItems = useMemo(
    () =>
      (sinistradosQ.data ?? []).map((s) => ({
        value: s.id,
        label: `${s.codigoSinistro}${s.utenteNome ? ` — ${s.utenteNome}` : ''}`,
      })),
    [sinistradosQ.data],
  )

  const infoMutation = useSinistradosInfoFaturacaoMutation()

  useEffect(() => {
    if (!open) return
    setSinistradoId('')
    setSinistradoLabel('')
    setSinistradoSearch('')
    setDataDesde('')
    setDataAte('')
  }, [open])

  const handleConfirm = async () => {
    if (clinicaConfigQ.isLoading && !authClientId) {
      toast.error('A carregar a clínica atual. Tente novamente.')
      return
    }
    if (!clinicaId) {
      toast.error(
        'Clínica atual não disponível. Selecione a clínica no início da sessão.',
      )
      return
    }
    if (!sinistradoId) {
      toast.error('Selecione uma ficha de sinistrado.')
      return
    }
    if (dataDesde && dataAte && dataDesde > dataAte) {
      toast.error('A data inicial não pode ser posterior à data final.')
      return
    }

    const res = await infoMutation.mutateAsync({
      sinistradoId,
      dataDesde: dataDesde || null,
      dataAte: dataAte || null,
      clinicaOrigemServicosId: clinicaId || null,
    })

    if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
      const msg =
        res.info?.messages?.$?.[0] ??
        res.info?.messages?.['']?.[0] ??
        'Não foi possível obter dados do sinistrado.'
      toast.error(msg)
      return
    }

    onApply(res.info.data)
    onOpenChange(false)
    toast.success('Linhas do sinistrado aplicadas ao documento.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Sinistrados</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className={fieldGap}>
            <Label className={labelClass}>Sinistrado</Label>
            <AsyncCombobox
              value={sinistradoId}
              onChange={(id) => {
                setSinistradoId(id)
                const item = sinistradoItems.find((i) => i.value === id)
                setSinistradoLabel(item?.label ?? '')
              }}
              items={
                sinistradoLabel && !sinistradoItems.some((i) => i.value === sinistradoId)
                  ? [{ value: sinistradoId, label: sinistradoLabel }, ...sinistradoItems]
                  : sinistradoItems
              }
              isLoading={sinistradosQ.isFetching}
              placeholder='Pesquisar por código...'
              searchPlaceholder='Código sinistro...'
              emptyText='Sem sinistrados'
              searchValue={sinistradoSearch}
              onSearchValueChange={setSinistradoSearch}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Serviços desde</Label>
              <Input
                type='date'
                className={inputClass}
                value={dataDesde}
                onChange={(e) => setDataDesde(e.target.value)}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Serviços até</Label>
              <Input
                type='date'
                className={inputClass}
                value={dataAte}
                onChange={(e) => setDataAte(e.target.value)}
              />
            </div>
          </div>
          {clinicaNome ? (
            <p className='text-muted-foreground text-xs'>
              Clínica de faturação: {clinicaNome}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => void handleConfirm()}
            disabled={infoMutation.isPending || !clinicaId}
          >
            {infoMutation.isPending ? 'A carregar…' : 'Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
