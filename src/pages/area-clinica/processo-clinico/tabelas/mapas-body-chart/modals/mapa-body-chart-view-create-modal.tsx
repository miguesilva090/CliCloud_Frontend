import { useEffect, useState } from 'react'
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
import { ImageUploader } from '@/components/shared/image-uploader'
import type {
  CreateMapaBodyChartRequest,
  MapaBodyChartTableDTO,
  UpdateMapaBodyChartRequest,
} from '@/types/dtos/processo-clinico/body-chart.dtos'
import { MapaBodyChartService } from '@/lib/services/processo-clinico/body-chart-service'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import state from '@/states/state'
import { toFullUrl } from '@/utils/image-url-helpers'

type Mode = 'view' | 'create' | 'edit'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Mode
  viewData: MapaBodyChartTableDTO | null
  onSuccess?: () => void
}

export function MapaBodyChartViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<CreateMapaBodyChartRequest>({
    nome: '',
    caminhoImagem: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Atualiza o formulário quando estamos em modo ver/editar
  useEffect(() => {
    if (viewData && (mode === 'view' || mode === 'edit')) {
      setForm({
        nome: viewData.nome ?? '',
        caminhoImagem: viewData.caminhoImagem ?? '',
      })
    }
  }, [viewData, mode])

  // Sempre que abrimos o modal em modo criar, limpa o formulário
  useEffect(() => {
    if (open && mode === 'create') {
      setForm({
        nome: '',
        caminhoImagem: '',
      })
    }
  }, [open, mode])

  const isViewMode = mode === 'view'

  const handleSubmit = async () => {
    if (isViewMode) {
      onOpenChange(false)
      return
    }

    if (!form.nome || !form.caminhoImagem) {
      toast.error('Preencha o título e o caminho da imagem.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        const body: CreateMapaBodyChartRequest = {
          nome: form.nome,
          caminhoImagem: form.caminhoImagem,
        }
        const response = await MapaBodyChartService().create(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Mapa de Body Chart criado com sucesso.')
          onSuccess?.()
          onOpenChange(false)
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar o Mapa de Body Chart.'
          toast.error(msg)
        }
      } else if (mode === 'edit' && viewData?.id) {
        const body: UpdateMapaBodyChartRequest = {
          nome: form.nome,
          caminhoImagem: form.caminhoImagem,
        }
        const response = await MapaBodyChartService().update(viewData.id, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Mapa de Body Chart atualizado com sucesso.')
          onSuccess?.()
          onOpenChange(false)
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar o Mapa de Body Chart.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ??
          'Ocorreu um erro ao gravar o Mapa de Body Chart.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (value: boolean) => {
    if (!isSubmitting) {
      onOpenChange(value)
    }
  }

  const rawImagePath = form.caminhoImagem || viewData?.caminhoImagem || ''
  const imageUrl =
    rawImagePath ? toFullUrl(rawImagePath, state.URL) ?? rawImagePath : ''

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Novo Mapa de Body Chart'
              : mode === 'edit'
                ? 'Editar Mapa de Body Chart'
                : 'Mapa de Body Chart'}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 md:grid-cols-[2fr,1fr]'>
          <div className='space-y-3'>
            <div>
              <Label htmlFor='nome'>Título</Label>
              <Input
                id='nome'
                value={form.nome}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nome: e.target.value }))
                }
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>Imagem do mapa</Label>
              <p className='mb-1 text-[11px] text-muted-foreground'>
                Clique para escolher a imagem a partir do seu computador. O
                caminho será preenchido automaticamente.
              </p>
              <ImageUploader
                uploadUrl='/client/utility/ImageUpload/upload-image'
                fieldName='File'
                additionalFields={{ Subfolder: 'MapasBodyChart' }}
                currentImageUrl={imageUrl || undefined}
                placeholder='Clique ou arraste uma imagem para o mapa.'
                variant='default'
                disabled={isViewMode}
                showMetadata={false}
                onUploadSuccess={(partialUrl) => {
                  setForm((prev) => ({
                    ...prev,
                    caminhoImagem: partialUrl ?? '',
                  }))
                }}
                onUploadError={(err) => {
                  const message =
                    err instanceof Error ? err.message : String(err)
                  toast.error(
                    message || 'Ocorreu um erro ao enviar a imagem.',
                  )
                }}
              />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='w-full rounded-md border bg-muted/40 flex items-center justify-center px-2 py-2'>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={form.nome || 'Mapa de Body Chart'}
                  className='max-h-64 w-auto max-w-full object-contain'
                />
              ) : (
                <span className='text-xs text-muted-foreground'>
                  Pré-visualização da imagem
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Fechar
          </Button>
          {!isViewMode && (
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A gravar...' : 'Gravar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

