import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { modules } from '@/config/modules'
import { UtentePatologiaComparticipacaoService } from '@/lib/services/prescricao/utente-patologia-comparticipacao-service'
import { ResponseStatus } from '@/types/api/responses'
import type { UtentePatologiaComparticipacaoDTO } from '@/types/dtos/prescricao/utente-patologia-comparticipacao.dtos'
import { toast } from '@/utils/toast-utils'
import { useRegimesExcepcionaisInfarmed } from '../queries/utente-patologias-queries'

type Draft = { codigo: number; designacao: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  initial: UtentePatologiaComparticipacaoDTO[]
  onSaved: () => void
}

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

function regimeCodigo(r: Record<string, unknown>): number {
  return Number(r.regimeExcepcionalId ?? r.REGIME_EXCECIONAL_ID ?? 0)
}

function regimeNome(r: Record<string, unknown>): string {
  return String(r.descr ?? r.DESCR ?? '').trim()
}

export function ReceitaPatologiasDialog({
  open,
  onOpenChange,
  utenteId,
  initial,
  onSaved,
}: Props) {
  const [draft, setDraft] = useState<Draft[]>([])
  const [selectedCodigo, setSelectedCodigo] = useState<number | null>(null)
  const [insertOpen, setInsertOpen] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('')
  const [catalogSelected, setCatalogSelected] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const regimesQuery = useRegimesExcepcionaisInfarmed(open && insertOpen)

  useEffect(() => {
    if (!open) return
    setDraft(
      initial.map((x) => ({
        codigo: x.codigoComparticipacao,
        designacao: x.designacao?.trim() || String(x.codigoComparticipacao),
      }))
    )
    setSelectedCodigo(null)
    setInsertOpen(false)
  }, [open, initial])

  const catalog = useMemo(() => {
    const envelope = regimesQuery.data?.info
    if (!envelope || envelope.status !== ResponseStatus.Success) return []
    const raw = (envelope.data ?? []) as unknown as Record<string, unknown>[]
    const q = catalogFilter.trim().toLowerCase()
    return raw
      .map((r) => ({ codigo: regimeCodigo(r), nome: regimeNome(r) }))
      .filter((x) => x.codigo > 0 && x.nome)
      .filter(
        (x) =>
          !q ||
          x.nome.toLowerCase().includes(q) ||
          String(x.codigo).includes(q)
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
  }, [regimesQuery.data, catalogFilter])

  const handleInsert = () => {
    if (catalogSelected == null) return
    const item = catalog.find((x) => x.codigo === catalogSelected)
    if (!item) return
    if (draft.some((d) => d.codigo === item.codigo)) {
      toast.error('O utente já tem associada a patologia indicada')
      return
    }
    setDraft((prev) => [
      ...prev,
      { codigo: item.codigo, designacao: item.nome },
    ])
    setInsertOpen(false)
    setCatalogSelected(null)
    setCatalogFilter('')
  }

  const handleRemove = () => {
    if (selectedCodigo == null) return
    setDraft((prev) => prev.filter((x) => x.codigo !== selectedCodigo))
    setSelectedCodigo(null)
  }

  const handleSave = async () => {
    if (!utenteId) {
      toast.error('Seleccione o utente.')
      return
    }
    setSaving(true)
    try {
      const res = await UtentePatologiaComparticipacaoService(
        permissionId
      ).replaceByUtente(utenteId, {
        utenteId,
        items: draft.map((d) => ({
          codigoComparticipacao: d.codigo,
          designacao: d.designacao,
        })),
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('As patologias do utente foram atualizadas')
        onSaved()
        onOpenChange(false)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .filter(Boolean)
            .join(' ') || 'Falha ao guardar patologias.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar patologias.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Patologias</DialogTitle>
          </DialogHeader>

          <div className='flex gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setInsertOpen(true)}
            >
              <Plus className='mr-1 h-4 w-4' />
              Inserir
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={handleRemove}
              disabled={selectedCodigo == null}
            >
              <Trash2 className='mr-1 h-4 w-4' />
              Remover
            </Button>
          </div>

          <div className='max-h-64 overflow-auto rounded-md border'>
            {draft.length === 0 ? (
              <p className='p-3 text-sm text-muted-foreground'>
                Sem patologias.
              </p>
            ) : (
              draft.map((d) => (
                <button
                  key={d.codigo}
                  type='button'
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm hover:bg-accent',
                    selectedCodigo === d.codigo &&
                      'bg-primary/15 font-medium text-primary'
                  )}
                  onClick={() => setSelectedCodigo(d.codigo)}
                >
                  {d.designacao}
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type='button' onClick={handleSave} disabled={saving}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={insertOpen} onOpenChange={setInsertOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Inserir patologia</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <Label>Pesquisar</Label>
            <Input
              className='h-8'
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
              placeholder='Nome ou código…'
            />
            <div className='max-h-72 overflow-auto rounded-md border'>
              {regimesQuery.isFetching ? (
                <p className='p-3 text-sm text-muted-foreground'>A carregar…</p>
              ) : catalog.length === 0 ? (
                <p className='p-3 text-sm text-muted-foreground'>Sem resultados.</p>
              ) : (
                catalog.map((c) => (
                  <button
                    key={c.codigo}
                    type='button'
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-accent',
                      catalogSelected === c.codigo &&
                        'bg-primary/15 font-medium text-primary'
                    )}
                    onClick={() => setCatalogSelected(c.codigo)}
                  >
                    <span className='text-muted-foreground'>{c.codigo}</span>
                    {' — '}
                    {c.nome}
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setInsertOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type='button'
              onClick={handleInsert}
              disabled={catalogSelected == null}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
