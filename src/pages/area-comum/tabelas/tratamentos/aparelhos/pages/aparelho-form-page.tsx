import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { AparelhoService } from '@/lib/services/aparelho'
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'
import { ModeloAparelhoService } from '@/lib/services/modelo-aparelho'
import { ResponseStatus } from '@/types/api/responses'
import type { TipoAparelhoLightDTO } from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'
import type { ModeloAparelhoLightDTO } from '@/types/dtos/modelo-aparelho/modelo-aparelho.dtos'
import { MarcasAparelhoViewCreateModal } from '../../marcas-aparelho/modals/marcas-aparelho-view-create-modal'
import { ModelosAparelhoViewCreateModal } from '../../modelos-aparelho/modals/modelos-aparelho-view-create-modal'

const LISTAGEM_PATH = '/area-comum/tabelas/tratamentos/aparelhos'

export function AparelhoFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tipoAparelhoId, setTipoAparelhoId] = useState('')
  const [modeloAparelhoId, setModeloAparelhoId] = useState<string | null>(null)
  const [codigoSerie, setCodigoSerie] = useState('')
  const [codigoInventario, setCodigoInventario] = useState('')
  const [local, setLocal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [tipos, setTipos] = useState<TipoAparelhoLightDTO[]>([])
  const [modelos, setModelos] = useState<ModeloAparelhoLightDTO[]>([])
  const [modalMarcaOpen, setModalMarcaOpen] = useState(false)
  const [modalModeloOpen, setModalModeloOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const marcaDisplay =
    modeloAparelhoId
      ? (modelos.find((m) => m.id === modeloAparelhoId) as { marcaAparelhoDesignacao?: string } | undefined)?.marcaAparelhoDesignacao ?? ''
      : ''

  useEffect(() => {
    TipoAparelhoService()
      .getTipoAparelhoLight()
      .then((r) => {
        const data = (r.info as { data?: TipoAparelhoLightDTO[] })?.data ?? []
        setTipos(Array.isArray(data) ? data : [])
      })
      .catch(() => setTipos([]))
    ModeloAparelhoService()
      .getModeloAparelhoLight()
      .then((r) => {
        const data = (r.info as { data?: ModeloAparelhoLightDTO[] })?.data ?? []
        setModelos(Array.isArray(data) ? data : [])
      })
      .catch(() => setModelos([]))
  }, [])

  const handleGuardar = async () => {
    if (!tipoAparelhoId) {
      toast.error('Tipo de aparelho é obrigatório.')
      return
    }
    setSaving(true)
    try {
      const client = AparelhoService()
      const body = {
        tipoAparelhoId,
        modeloAparelhoId: modeloAparelhoId && modeloAparelhoId.trim() ? modeloAparelhoId.trim() : null,
        codigoSerie: codigoSerie.trim() || null,
        codigoInventario: codigoInventario.trim() || null,
        local: local.trim() || null,
        observacoes: observacoes.trim() || null,
        ocupado,
      }
      const response = await client.createAparelho(body)
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Aparelho criado com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['aparelhos-paginated'] })
        navigateManagedWindow(navigate, LISTAGEM_PATH)
      } else {
        const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao criar.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Novo Aparelho</h1>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => navigateManagedWindow(navigate, LISTAGEM_PATH)}>
              Voltar
            </Button>
            <Button size='sm' onClick={handleGuardar} disabled={saving}>
              {saving ? 'A guardar…' : 'Guardar'}
            </Button>
          </div>
        </div>

        <Card className='rounded-t-none border-t-0'>
          <CardHeader className='py-3'>
            <p className='text-sm text-muted-foreground'>
              Pode abrir Marcas ou Modelos noutra janela e voltar a este registo pelas abas em baixo.
            </p>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
              <div className='grid gap-1.5'>
                <Label>Tipo de Aparelho</Label>
                <Select value={tipoAparelhoId} onValueChange={setTipoAparelhoId}>
                  <SelectTrigger><SelectValue placeholder='Selecionar tipo...' /></SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {(t as { designacao?: string }).designacao ?? (t as { Designacao?: string }).Designacao ?? t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-1.5'>
                <Label>Código Série</Label>
                <Input value={codigoSerie} maxLength={50} placeholder='Código série...' onChange={(e) => setCodigoSerie(e.target.value)} />
              </div>
              <div className='grid gap-1.5'>
                <Label>Marca</Label>
                <div className='flex gap-1.5'>
                  <Input
                    readOnly
                    disabled
                    value={marcaDisplay}
                    placeholder='Preenchido ao escolher um modelo'
                    className='bg-muted cursor-not-allowed flex-1 min-w-0'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-9 w-9'
                    title='Adicionar marca'
                    onClick={() => setModalMarcaOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-1.5'>
                <Label>Modelo</Label>
                <div className='flex gap-1.5'>
                  <Select
                    value={modeloAparelhoId ?? undefined}
                    onValueChange={(v) => setModeloAparelhoId(v && v.trim() ? v : null)}
                  >
                    <SelectTrigger className='flex-1 min-w-0'><SelectValue placeholder='Selecionar modelo (opcional)...' /></SelectTrigger>
                    <SelectContent>
                      {modelos.filter((m) => m.id != null && String(m.id).trim() !== '').map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {(m as { designacao?: string }).designacao ?? (m as { Designacao?: string }).Designacao ?? m.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-9 w-9'
                    title='Adicionar modelo'
                    onClick={() => setModalModeloOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-1.5'>
                <Label>Código Inventário</Label>
                <Input value={codigoInventario} maxLength={50} placeholder='Código inventário...' onChange={(e) => setCodigoInventario(e.target.value)} />
              </div>
              <div className='grid gap-1.5'>
                <Label>Local</Label>
                <Input value={local} maxLength={100} placeholder='Local...' onChange={(e) => setLocal(e.target.value)} />
              </div>
              <div className='grid gap-1.5 sm:col-span-2'>
                <Label>Observações</Label>
                <Input value={observacoes} maxLength={500} placeholder='Observações...' onChange={(e) => setObservacoes(e.target.value)} />
              </div>
              <div className='flex items-center gap-2 sm:col-span-2'>
                <Checkbox id='ocupado-page' checked={ocupado} onCheckedChange={(c) => setOcupado(!!c)} />
                <Label htmlFor='ocupado-page' className='cursor-pointer'>Ocupado</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <MarcasAparelhoViewCreateModal
          open={modalMarcaOpen}
          onOpenChange={setModalMarcaOpen}
          mode='create'
          viewData={null}
          onSuccess={() => setModalMarcaOpen(false)}
        />
        <ModelosAparelhoViewCreateModal
          open={modalModeloOpen}
          onOpenChange={setModalModeloOpen}
          mode='create'
          viewData={null}
          onSuccess={() => {
            setModalModeloOpen(false);
            ModeloAparelhoService()
              .getModeloAparelhoLight()
              .then((r) => {
                const data = (r.info as { data?: ModeloAparelhoLightDTO[] })?.data ?? [];
                setModelos(Array.isArray(data) ? data : []);
              })
              .catch(() => setModelos([]));
          }}
        />
      </DashboardPageContainer>
    </>
  );
}
