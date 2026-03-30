import { useEffect, useState } from 'react'
import type { FuncionarioTableDTO } from '@/types/dtos/saude/funcionarios.dtos'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from '@/utils/toast-utils'
import { useCodigosPostaisLight } from '@/lib/services/utility/lookups/lookups-queries'
import { CreateCodigoPostalModal } from '@/components/shared/address-quick-create'
import { FuncionarioService } from '@/lib/services/saude/funcionario-service'
import { resolveRuaNomeToId } from '@/lib/utils/resolve-rua'
import { ResponseStatus } from '@/types/api/responses'
import { ENTIDADE_TIPO } from '@/lib/entidade-tipo'
import type { FuncionarioDTO } from '@/types/dtos/saude/funcionarios.dtos'

/** EntidadeTipo.Funcionario = 5 */
const TIPO_ENTIDADE_FUNCIONARIO = ENTIDADE_TIPO.Funcionario

type ModalMode = 'view' | 'create' | 'edit'

interface FuncionarioViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: FuncionarioTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  nome: string
  nomeUtilizador: string
  rua: string
  codigoPostalId: string
  numeroContribuinte: string
  telefone: string
  numeroCartaoIdentificacao: string
  arquivo: string
  dataEmissao: string
}

function getTelefoneFromContactos(contactos: import('@/types/dtos/saude/funcionarios.dtos').EntidadeContactoItem[] | null | undefined): string {
  if (!contactos?.length) return ''
  const tel = contactos.find((c) => c.entidadeContactoTipoId === 1)
  return tel?.valor ?? ''
}

export function FuncionarioViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: FuncionarioViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    nomeUtilizador: '',
    rua: '',
    codigoPostalId: '',
    numeroContribuinte: '',
    telefone: '',
    numeroCartaoIdentificacao: '',
    arquivo: '',
    dataEmissao: '',
  })
  const [fullData, setFullData] = useState<FuncionarioDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modalCodigoPostal, setModalCodigoPostal] = useState(false)

  const codigosPostaisQuery = useCodigosPostaisLight('')
  const codigosPostais = codigosPostaisQuery.data?.info?.data ?? []

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData?.id) {
      setLoading(true)
      FuncionarioService('funcionarios')
        .getFuncionario(viewData.id)
        .then((res) => {
          const raw = res.info as { data?: FuncionarioDTO }
          const info = raw?.data
          if (info) {
            setFullData(info)
            const ruaNome = info.rua?.nome ?? (info.rua as { Nome?: string })?.Nome ?? ''
            const dataEmissao = info.dataEmissaoCartaoIdentificacao
              ? String(info.dataEmissaoCartaoIdentificacao).slice(0, 10)
              : ''
            setValues({
              nome: info.nome ?? '',
              nomeUtilizador: info.nomeUtilizador ?? '',
              rua: ruaNome,
              codigoPostalId: info.codigoPostalId ? String(info.codigoPostalId) : '',
              numeroContribuinte: info.numeroContribuinte ?? '',
              telefone: getTelefoneFromContactos(info.entidadeContactos ?? []),
              numeroCartaoIdentificacao: info.numeroCartaoIdentificacao ?? '',
              arquivo: info.arquivo ?? '',
              dataEmissao,
            })
          }
        })
        .catch(() => toast.error('Erro ao carregar funcionário.'))
        .finally(() => setLoading(false))
    }
    if (open && mode === 'create') {
      setFullData(null)
      setValues({
        nome: '',
        nomeUtilizador: '',
        rua: '',
        codigoPostalId: '',
        numeroContribuinte: '',
        telefone: '',
        numeroCartaoIdentificacao: '',
        arquivo: '',
        dataEmissao: '',
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

    const ruaTrim = values.rua?.trim()
    const cpId = values.codigoPostalId?.trim()
    if (ruaTrim && !cpId) {
      toast.error('Código Postal é obrigatório quando preenche a Rua.')
      return
    }
    if (cpId && !ruaTrim) {
      toast.error('Rua é obrigatória quando seleciona Código Postal.')
      return
    }

    try {
      setIsSaving(true)
      const client = FuncionarioService('funcionarios')

      let ruaId: string | undefined
      if (isEdit && fullData?.ruaId) {
        ruaId = String(fullData.ruaId)
      } else if (ruaTrim && cpId) {
        ruaId = await resolveRuaNomeToId(ruaTrim, cpId)
      }

      const toStr = (v: unknown) => (v != null && v !== undefined ? String(v) : '')
      const body = {
        nome: values.nome.trim(),
        tipoEntidadeId: TIPO_ENTIDADE_FUNCIONARIO,
        email: undefined as string | undefined,
          nomeUtilizador: values.nomeUtilizador?.trim() || undefined,
        numeroContribuinte: values.numeroContribuinte?.trim() || undefined,
        ruaId,
        codigoPostalId: cpId || (fullData?.codigoPostalId ? toStr(fullData.codigoPostalId) : undefined),
        freguesiaId: fullData?.freguesiaId ? toStr(fullData.freguesiaId) : undefined,
        concelhoId: fullData?.concelhoId ? toStr(fullData.concelhoId) : undefined,
        distritoId: fullData?.distritoId ? toStr(fullData.distritoId) : undefined,
        paisId: fullData?.paisId ? toStr(fullData.paisId) : undefined,
        numeroPorta: fullData?.numeroPorta ?? undefined,
        andarRua: fullData?.andarRua ?? undefined,
        observacoes: undefined,
        status: fullData?.status ?? 1,
        entidadeContactos: (() => {
          const telVal = values.telefone?.trim()
          const mapItem = (c: { id?: string | null; entidadeContactoTipoId: number; valor?: string | null; principal?: boolean }) => ({
            id: c.id,
            entidadeContactoTipoId: c.entidadeContactoTipoId,
            valor: c.valor ?? '',
            principal: c.principal ?? false,
          })
          if (telVal) {
            const telExist = fullData?.entidadeContactos?.find((c) => c.entidadeContactoTipoId === 1)
            const others = (fullData?.entidadeContactos ?? []).filter((c) => c.entidadeContactoTipoId !== 1).map(mapItem)
            return [
              { id: telExist && 'id' in telExist ? (telExist as { id?: string }).id : undefined, entidadeContactoTipoId: 1, valor: telVal, principal: false },
              ...others,
            ] as import('@/types/dtos/saude/funcionarios.dtos').UpsertEntidadeContactoItem[]
          }
          return (fullData?.entidadeContactos?.map(mapItem) ?? undefined) as import('@/types/dtos/saude/funcionarios.dtos').UpsertEntidadeContactoItem[] | undefined
        })(),
        numeroCartaoIdentificacao: values.numeroCartaoIdentificacao?.trim() || undefined,
        dataEmissaoCartaoIdentificacao: values.dataEmissao?.trim()
          ? (values.dataEmissao as unknown as string)
          : undefined,
        arquivo: values.arquivo?.trim() || undefined,
      }

      const rawId = viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.'
        )
        return
      }

      const response =
        isEdit && viewData && editId
          ? await client.updateFuncionario(editId, body as import('@/types/dtos/saude/funcionarios.dtos').UpdateFuncionarioRequest)
          : await client.createFuncionario(body as import('@/types/dtos/saude/funcionarios.dtos').CreateFuncionarioRequest)

      if (response.info?.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Funcionário atualizado com sucesso.'
            : 'Funcionário criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Funcionário.'
            : 'Falha ao criar Funcionário.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Funcionário.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const title =
    mode === 'view'
      ? 'Funcionarios'
      : mode === 'edit'
        ? 'Editar Funcionário'
        : 'Adicionar Funcionário'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar funcionário.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='py-8 text-center text-muted-foreground'>
            A carregar...
          </div>
        ) : (
          <div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
            <div className='space-y-2'>
              <Label>Nome</Label>
              <Input
                readOnly={isView}
                value={values.nome}
                maxLength={200}
                placeholder='Nome...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, nome: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Nome Utilizador</Label>
              <Input
                readOnly={isView}
                value={values.nomeUtilizador}
                maxLength={200}
                placeholder='Nome Utilizador...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, nomeUtilizador: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Rua</Label>
              <Input
                readOnly={isView}
                value={values.rua}
                maxLength={200}
                placeholder='Ex.: Rua das Flores'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, rua: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Código Postal</Label>
              <div className='flex gap-1.5'>
                <Select
                  value={values.codigoPostalId || ''}
                  onValueChange={(v) =>
                    setValues((prev) => ({ ...prev, codigoPostalId: v }))
                  }
                  disabled={codigosPostaisQuery.isLoading || isView}
                >
                  <SelectTrigger className='h-9 w-full min-w-0'>
                    <SelectValue placeholder='Selecionar código postal...' />
                  </SelectTrigger>
                  <SelectContent>
                    {codigosPostais.map((cp) => (
                      <SelectItem key={cp.id} value={cp.id}>
                        {cp.codigo ?? cp.id} {cp.localidade ? `– ${cp.localidade}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isView && (
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='shrink-0 h-9 w-9'
                    title='Adicionar código postal'
                    onClick={() => setModalCodigoPostal(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Nº Contribuinte</Label>
              <Input
                readOnly={isView}
                value={values.numeroContribuinte}
                maxLength={20}
                placeholder='Nº Contribuinte...'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    numeroContribuinte: e.target.value,
                  }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Telefone</Label>
              <Input
                readOnly={isView}
                value={values.telefone}
                maxLength={30}
                placeholder='Telefone...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, telefone: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Nº Cartão Identificação</Label>
              <Input
                readOnly={isView}
                value={values.numeroCartaoIdentificacao}
                maxLength={50}
                placeholder='Nº Cartão Identificação...'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    numeroCartaoIdentificacao: e.target.value,
                  }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Arquivo</Label>
              <Input
                readOnly={isView}
                value={values.arquivo}
                maxLength={100}
                placeholder='Arquivo...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, arquivo: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Data Emissão</Label>
              <Input
                readOnly={isView}
                type='date'
                value={values.dataEmissao}
                placeholder='Data Emissão...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, dataEmissao: e.target.value }))
                }
              />
            </div>
          </div>
        )}
        {!isView && (
          <CreateCodigoPostalModal
            open={modalCodigoPostal}
            onOpenChange={setModalCodigoPostal}
            onSuccess={(newId) => {
              setValues((prev) => ({ ...prev, codigoPostalId: newId }))
              codigosPostaisQuery.refetch()
            }}
          />
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
              <Button
                type='button'
                onClick={handleGuardar}
                disabled={isSaving}
                size='sm'
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Gravar Funcionário
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
