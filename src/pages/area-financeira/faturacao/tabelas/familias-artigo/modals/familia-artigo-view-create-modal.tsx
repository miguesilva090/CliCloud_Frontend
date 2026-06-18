import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import type { FamiliaArtigoTableDTO } from '@/types/dtos/stocks/familia-artigo.dtos'
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
import { ImageUploader } from '@/components/shared/image-uploader'
import { toast } from '@/utils/toast-utils'
import { FamiliaArtigoService } from '@/lib/services/stocks/familia-artigo-service'
import { ResponseStatus } from '@/types/api/responses'
import { modules } from '@/config/modules'
import state from '@/states/state'
import { toFullUrl } from '@/utils/image-url-helpers'
type ModalMode = 'view' | 'create' | 'edit'

interface FamiliaArtigoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: FamiliaArtigoTableDTO | null
  parentId?: string | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  nivel: string
  descricao: string
  urlFoto: string
}

const emptyValues: FormValues = {
  codigo: '',
  nivel: '',
  descricao: '',
  urlFoto: '',
}

function resolveRowId(data: FamiliaArtigoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function FamiliaArtigoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  parentId,
  onSuccess,
}: FamiliaArtigoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

  const imageUrl = values.urlFoto
    ? toFullUrl(values.urlFoto, state.URL) ?? values.urlFoto
    : ''

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setValues({
        ...emptyValues,
        nivel: parentId ? '—' : '1',
      })
      return
    }

    const rowId = resolveRowId(viewData)
    if (!rowId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const response = await FamiliaArtigoService().getFamiliaArtigoById(rowId)
        if (cancelled) return

        if (
          response.info.status !== ResponseStatus.Success ||
          !response.info.data
        ) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar o registo.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          nivel: data.nivel != null ? String(data.nivel) : '',
          descricao: data.descricao ?? '',
          urlFoto: data.urlFoto ?? '',
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar registo.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, mode, viewData, parentId])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao?.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }

    const body = {
      descricao: values.descricao.trim(),
      urlFoto: values.urlFoto?.trim() || null,
    }

    try {
      const client = FamiliaArtigoService()
      const editId = resolveRowId(viewData)

      if (isEdit && editId) {
        const response = await client.updateFamiliaArtigo(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Registo atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar registo.'
          toast.error(msg)
        }
      } else {
        const response = await client.createFamiliaArtigo({
          ...body,
          parentId: parentId ?? null,
        })
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Registo criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar registo.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o registo.')
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Família de Artigo'
      : mode === 'edit'
        ? 'Editar Família de Artigo'
        : 'Família de Artigo'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de família de artigo.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='grid gap-4 py-2 md:grid-cols-[2fr,1fr]'>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='familia-codigo'>Código</Label>
                  <Input
                    id='familia-codigo'
                    value={values.codigo || (mode === 'create' ? '—' : '')}
                    readOnly
                    className='bg-muted'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='familia-nivel'>Nível</Label>
                  <Input
                    id='familia-nivel'
                    value={values.nivel || (mode === 'create' ? '—' : '')}
                    readOnly
                    className='bg-muted'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='familia-descricao'>Descrição</Label>
                <Input
                  id='familia-descricao'
                  value={values.descricao}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, descricao: e.target.value }))
                  }
                  readOnly={isView}
                  maxLength={50}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Foto</Label>
              <ImageUploader
                key={`familia-artigo-foto-${resolveRowId(viewData) || 'new'}-${values.urlFoto || 'sem'}`}
                idFuncionalidade={tabelasPermId}
                uploadUrl='/client/utility/ImageUpload/upload-image'
                fieldName='File'
                additionalFields={{ Subfolder: 'FamiliasArtigo' }}
                currentImageUrl={imageUrl || undefined}
                disabled={isView}
                showMetadata={false}
                variant='compact'
                placeholder=''
                actionButtonLabel='Foto'
                actionButtonShowLabel={false}
                showFileTypesHint={false}
                showRemoveButtonAlways
                rootClassName='border-solid border-[#2aa89a] bg-background/0 backdrop-blur-0 w-full max-w-[180px] h-[110px]'
                actionButtonClassName='bg-[#2aa89a] text-white hover:bg-[#239b8f]'
                placeholderIcon={
                  <User className='h-8 w-8 text-muted-foreground/40' />
                }
                onPartialUrlChange={(partialUrl) =>
                  setValues((p) => ({ ...p, urlFoto: partialUrl ?? '' }))
                }
                onUploadSuccess={(partialUrl) =>
                  setValues((p) => ({ ...p, urlFoto: partialUrl ?? '' }))
                }
                onUploadError={(err) => {
                  const message =
                    err instanceof Error ? err.message : String(err)
                  toast.error(message || 'Ocorreu um erro ao enviar a imagem.')
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>
              OK
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} disabled={loading}>
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}