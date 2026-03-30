import { useEffect, useState } from 'react'
import type { OrganismoTableDTO, OrganismoDTO } from '@/types/dtos/saude/organismos.dtos'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/utils/toast-utils'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ResponseStatus } from '@/types/api/responses'
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'

type ModalMode = 'view' | 'create' | 'edit'

interface OrganismoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: OrganismoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  nome: string
  nomeComercial: string
  abreviatura: string
  email: string
  numeroContribuinte: string
  contacto: string
  prazoPagamento: string
  desconto: string
  descontoUtente: string
  globalbooking: boolean
}

export function OrganismoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: OrganismoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    codigo: '',
    nome: '',
    nomeComercial: '',
    abreviatura: '',
    email: '',
    numeroContribuinte: '',
    contacto: '',
    prazoPagamento: '',
    desconto: '',
    descontoUtente: '',
    globalbooking: false,
  })
  const [fullData, setFullData] = useState<OrganismoDTO | null>(null)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData?.id) {
      setLoading(true)
      OrganismoService('organismos')
        .getOrganismo(viewData.id)
        .then((res) => {
          const info = (res.info as { data?: OrganismoDTO })?.data
          if (info) {
            setFullData(info)
            setValues({
              codigo: String((viewData as { Id?: string }).Id ?? viewData.id ?? '').substring(0, 8),
              nome: info.nome ?? '',
              nomeComercial: info.nomeComercial ?? '',
              abreviatura: info.abreviatura ?? '',
              email: info.email ?? '',
              numeroContribuinte: info.numeroContribuinte ?? '',
              contacto: info.contacto ?? '',
              prazoPagamento: info.prazoPagamento != null ? String(info.prazoPagamento) : '',
              desconto: info.desconto != null ? String(info.desconto) : '',
              descontoUtente: info.descontoUtente != null ? String(info.descontoUtente) : '',
              globalbooking: info.globalbooking ?? false,
            })
          }
        })
        .catch(() => toast.error('Erro ao carregar organismo.'))
        .finally(() => setLoading(false))
    }
    if (open && mode === 'create') {
      setFullData(null)
      setValues({
        codigo: '',
        nome: '',
        nomeComercial: '',
        abreviatura: '',
        email: '',
        numeroContribuinte: '',
        contacto: '',
        prazoPagamento: '',
        desconto: '',
        descontoUtente: '',
        globalbooking: false,
      })
    }
  }, [open, mode, isView, isEdit, viewData?.id])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    if (mode === 'create') {
      toast.warning(
        'Para criar um novo organismo, utilize o formulário de Utentes (Subsistema Saúde) ou a criação rápida a partir da morada do utente. O formulário completo de organismos está em desenvolvimento.'
      )
      return
    }

    if (!fullData || !viewData?.id) {
      toast.error('Dados insuficientes para atualizar.')
      return
    }

    try {
      const toStr = (v: unknown) => (v != null && v !== undefined ? String(v) : '')
      const body = {
        nome: values.nome.trim(),
        tipoEntidadeId: ENTIDADE_TIPO.Organismo,
        email: values.email?.trim() || fullData.email || '',
        numeroContribuinte: values.numeroContribuinte?.trim() || fullData.numeroContribuinte || '',
        ruaId: toStr(fullData.ruaId),
        codigoPostalId: toStr(fullData.codigoPostalId),
        freguesiaId: toStr(fullData.freguesiaId),
        concelhoId: toStr(fullData.concelhoId),
        distritoId: toStr(fullData.distritoId),
        paisId: toStr(fullData.paisId),
        numeroPorta: fullData.numeroPorta ?? '-',
        andarRua: fullData.andarRua ?? '-',
        observacoes: fullData.observacoes ?? '',
        status: fullData.status ?? 1,
        entidadeContactos:
          fullData.entidadeContactos?.map((c: { entidadeContactoTipoId: number; valor?: string | null; principal?: boolean }) => ({
            entidadeContactoTipoId: c.entidadeContactoTipoId,
            valor: c.valor ?? '',
            principal: c.principal ?? false,
          })) ?? [{ entidadeContactoTipoId: 3, valor: values.email || '', principal: true }],
        nomeComercial: values.nomeComercial?.trim() || null,
        abreviatura: values.abreviatura?.trim() || null,
        contacto: values.contacto?.trim() || null,
        prazoPagamento: values.prazoPagamento ? parseInt(values.prazoPagamento, 10) : null,
        desconto: values.desconto ? parseFloat(values.desconto.replace(',', '.')) : null,
        descontoUtente: values.descontoUtente ? parseFloat(values.descontoUtente.replace(',', '.')) : null,
        globalbooking: values.globalbooking,
      }

      const response = await OrganismoService('organismos').updateOrganismo(
        viewData.id,
        body as import('@/types/dtos/saude/organismos.dtos').UpdateOrganismoRequest
      )

      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Organismo atualizado com sucesso.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao atualizar Organismo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o Organismo.')
    }
  }

  const title =
    mode === 'view'
      ? 'Organismos'
      : mode === 'edit'
        ? 'Editar Organismos'
        : 'Adicionar Organismo'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar organismo.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-8 text-center text-muted-foreground'>
            A carregar...
          </div>
        ) : (
          <Tabs defaultValue='identificacao' className='flex-1 min-h-0 flex flex-col overflow-hidden'>
            <TabsList>
              <TabsTrigger value='identificacao'>Identificação</TabsTrigger>
              <TabsTrigger value='outros' disabled>Outros Parâmetros</TabsTrigger>
              <TabsTrigger value='sns' disabled>Informação SNS</TabsTrigger>
              <TabsTrigger value='faturacao' disabled>Faturação</TabsTrigger>
            </TabsList>
            <TabsContent value='identificacao' className='flex-1 overflow-y-auto py-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Código</Label>
                  <Input readOnly value={values.codigo} className='bg-muted' />
                </div>
                <div className='space-y-2'>
                  <Label>Nome</Label>
                  <Input
                    readOnly={isView}
                    value={values.nome}
                    onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
                    placeholder='Nome...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Nome Comercial</Label>
                  <Input
                    readOnly={isView}
                    value={values.nomeComercial}
                    onChange={(e) => setValues((p) => ({ ...p, nomeComercial: e.target.value }))}
                    placeholder='Nome Comercial...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Abreviatura</Label>
                  <Input
                    readOnly={isView}
                    value={values.abreviatura}
                    onChange={(e) => setValues((p) => ({ ...p, abreviatura: e.target.value }))}
                    placeholder='Abreviatura...'
                  />
                </div>
                <div className='space-y-2 col-span-2'>
                  <Label>Email</Label>
                  <Input
                    readOnly={isView}
                    type='email'
                    value={values.email}
                    onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
                    placeholder='Email...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Nr. Contribuinte</Label>
                  <Input
                    readOnly={isView}
                    value={values.numeroContribuinte}
                    onChange={(e) => setValues((p) => ({ ...p, numeroContribuinte: e.target.value }))}
                    placeholder='Nr. Contribuinte...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Telefone</Label>
                  <Input
                    readOnly={isView}
                    value={values.contacto}
                    onChange={(e) => setValues((p) => ({ ...p, contacto: e.target.value }))}
                    placeholder='Telefone...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Prazo Pagamento</Label>
                  <Input
                    readOnly={isView}
                    value={values.prazoPagamento}
                    onChange={(e) => setValues((p) => ({ ...p, prazoPagamento: e.target.value }))}
                    placeholder='Prazo...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Desconto Clínica (%)</Label>
                  <Input
                    readOnly={isView}
                    value={values.desconto}
                    onChange={(e) => setValues((p) => ({ ...p, desconto: e.target.value }))}
                    placeholder='Desconto...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Desconto Utente (%)</Label>
                  <Input
                    readOnly={isView}
                    value={values.descontoUtente}
                    onChange={(e) => setValues((p) => ({ ...p, descontoUtente: e.target.value }))}
                    placeholder='Desconto Utente...'
                  />
                </div>
                <div className='space-y-2 flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={values.globalbooking}
                    onChange={(e) => setValues((p) => ({ ...p, globalbooking: e.target.checked }))}
                    disabled={isView}
                  />
                  <Label>Globalbooking</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleClose}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                Gravar Organismo
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
