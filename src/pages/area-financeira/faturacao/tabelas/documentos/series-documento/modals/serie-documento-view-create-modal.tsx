import { useEffect, useState } from 'react'
import type { TipoDocumentoTableDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import type { TipoDocumentoFormDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import type { NaturezaDocumentoLightDTO } from '@/types/dtos/faturacao/natureza-documento.dtos'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { TipoDocumentoService } from '@/lib/services/faturacao/tipo-documento-service'
import { NaturezaDocumentoService } from '@/lib/services/faturacao/natureza-documento-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface SerieDocumentoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoDocumentoTableDTO | null
  onSuccess?: () => void
}

const defaultFormValues = (): TipoDocumentoFormDTO => ({
  descricao: '',
  abreviatura: '',
  natureza: '',
  codigoTipoDocumentoSaft: null,
  numeroSerie: '',
  tipoSerie: 'N',
  numeroDocumento: 0,
  numVias: 1,
  inactivo: false,
  mostraFaturacao: true,
  descarregarTesouraria: false,
  habilitado: true,
  codigoATCUD: '',
  atcudEstado: '',
})

export function SerieDocumentoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: SerieDocumentoViewCreateModalProps) {
  const [values, setValues] = useState<TipoDocumentoFormDTO>(defaultFormValues())
  const [naturezas, setNaturezas] = useState<NaturezaDocumentoLightDTO[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return

    void NaturezaDocumentoService()
      .getNaturezasDocumentoLight()
      .then((response) => {
        if (response.info.status === ResponseStatus.Success) {
          setNaturezas(response.info.data ?? [])
        }
      })
      .catch(() => {
        toast.error('Erro ao carregar naturezas dos documentos.')
      })
  }, [open])

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setValues(defaultFormValues())
      return
    }

    if (!viewData?.id) return

    setLoadingDetail(true)
    void TipoDocumentoService()
      .getTipoDocumentoById(viewData.id)
      .then((response) => {
        if (response.info.status !== ResponseStatus.Success || !response.info.data) {
          toast.error('Erro ao carregar detalhe da série.')
          return
        }
        const dto = response.info.data
        setValues({
          descricao: dto.descricao ?? '',
          abreviatura: dto.abreviatura ?? '',
          natureza: dto.natureza ?? '',
          codigoTipoDocumentoSaft: dto.codigoTipoDocumentoSaft ?? null,
          numeroSerie: dto.numeroSerie ?? '',
          tipoSerie: dto.tipoSerie ?? 'N',
          numeroDocumento: dto.numeroDocumento ?? 0,
          numVias: dto.numVias ?? 1,
          inactivo: dto.inactivo,
          mostraFaturacao: dto.mostraFaturacao,
          descarregarTesouraria: dto.descarregarTesouraria,
          habilitado: dto.habilitado,
          codigoATCUD: dto.codigoATCUD ?? '',
          atcudEstado: dto.atcudEstado ?? '',
        })
      })
      .catch(() => {
        toast.error('Erro ao carregar detalhe da série.')
      })
      .finally(() => {
        setLoadingDetail(false)
      })
  }, [open, mode, viewData?.id])

  const handleGuardar = async () => {
    if (isView) return

    const descricao = values.descricao.trim()
    const abreviatura = values.abreviatura.trim()
    const numeroSerie = values.numeroSerie.trim()

    if (!descricao) {
      toast.error('Descrição é obrigatória.')
      return
    }
    if (!abreviatura) {
      toast.error('Abreviatura é obrigatória.')
      return
    }
    if (!numeroSerie) {
      toast.error('Número de série é obrigatório.')
      return
    }

    try {
      const client = TipoDocumentoService()
      const body: TipoDocumentoFormDTO = {
        ...values,
        descricao,
        abreviatura,
        numeroSerie,
        natureza: values.natureza.trim(),
        codigoATCUD: values.codigoATCUD.trim(),
        atcudEstado: values.atcudEstado.trim(),
      }

      const editId = viewData?.id

      if (isEdit && editId) {
        const response = await client.updateTipoDocumento(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Série do documento atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar.')
        }
      } else {
        const response = await client.createTipoDocumento(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Série do documento criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao criar.')
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao guardar a série do documento.')
    }
  }

  const title =
    mode === 'create'
      ? 'Nova Série do Documento'
      : mode === 'edit'
        ? 'Editar Série do Documento'
        : 'Detalhe da Série do Documento'

  const disabled = isView || loadingDetail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isView
              ? 'Visualizar série do documento.'
              : 'Preencha os dados da série.'}
          </DialogDescription>
        </DialogHeader>

        {loadingDetail ? (
          <p className='py-4 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 py-2'>
            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='serie-doc-descricao'>Descrição</Label>
              <Input
                id='serie-doc-descricao'
                value={values.descricao}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, descricao: e.target.value }))
                }
                disabled={disabled}
                maxLength={50}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-abreviatura'>Abreviatura</Label>
              <Input
                id='serie-doc-abreviatura'
                value={values.abreviatura}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, abreviatura: e.target.value }))
                }
                disabled={disabled || isEdit}
                maxLength={5}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-natureza'>Natureza</Label>
              <Select
                value={values.natureza || undefined}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, natureza: value }))
                }
                disabled={disabled}
              >
                <SelectTrigger id='serie-doc-natureza'>
                  <SelectValue placeholder='Seleccionar natureza' />
                </SelectTrigger>
                <SelectContent>
                  {naturezas.map((n) => (
                    <SelectItem key={n.id} value={n.sigla}>
                      {n.sigla} — {n.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-saft'>Tipo SAFT</Label>
              <Input
                id='serie-doc-saft'
                type='number'
                value={values.codigoTipoDocumentoSaft ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    codigoTipoDocumentoSaft: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                disabled={disabled}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-numero-serie'>Série</Label>
              <Input
                id='serie-doc-numero-serie'
                value={values.numeroSerie}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, numeroSerie: e.target.value }))
                }
                disabled={disabled}
                maxLength={14}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-tipo-serie'>Tipo Série</Label>
              <Input
                id='serie-doc-tipo-serie'
                value={values.tipoSerie}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, tipoSerie: e.target.value }))
                }
                disabled={disabled}
                maxLength={1}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-num-vias'>Nº Vias</Label>
              <Input
                id='serie-doc-num-vias'
                type='number'
                min={0}
                value={values.numVias}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    numVias: Number(e.target.value) || 0,
                  }))
                }
                disabled={disabled}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-numero-doc'>Nº Documento</Label>
              <Input
                id='serie-doc-numero-doc'
                type='number'
                min={0}
                value={values.numeroDocumento}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    numeroDocumento: Number(e.target.value) || 0,
                  }))
                }
                disabled={disabled}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-atcud'>Código ATCUD</Label>
              <Input
                id='serie-doc-atcud'
                value={values.codigoATCUD}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, codigoATCUD: e.target.value }))
                }
                disabled={disabled}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serie-doc-atcud-estado'>Estado ATCUD</Label>
              <Input
                id='serie-doc-atcud-estado'
                value={values.atcudEstado}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, atcudEstado: e.target.value }))
                }
                disabled={disabled}
              />
            </div>

            <div className='flex items-center gap-2 sm:col-span-2'>
              <Checkbox
                id='serie-doc-inactivo'
                checked={values.inactivo}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, inactivo: checked === true }))
                }
                disabled={disabled}
              />
              <Label htmlFor='serie-doc-inactivo'>Inactivo</Label>
            </div>

            <div className='flex items-center gap-2 sm:col-span-2'>
              <Checkbox
                id='serie-doc-mostra-faturacao'
                checked={values.mostraFaturacao}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    mostraFaturacao: checked === true,
                  }))
                }
                disabled={disabled}
              />
              <Label htmlFor='serie-doc-mostra-faturacao'>Visível na Faturação</Label>
            </div>

            <div className='flex items-center gap-2 sm:col-span-2'>
              <Checkbox
                id='serie-doc-habilitado'
                checked={values.habilitado}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, habilitado: checked === true }))
                }
                disabled={disabled}
              />
              <Label htmlFor='serie-doc-habilitado'>Habilitado</Label>
            </div>

            <div className='flex items-center gap-2 sm:col-span-2'>
              <Checkbox
                id='serie-doc-descarregar-tesouraria'
                checked={values.descarregarTesouraria}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    descarregarTesouraria: checked === true,
                  }))
                }
                disabled={disabled}
              />
              <Label htmlFor='serie-doc-descarregar-tesouraria'>
                Descarregar Tesouraria
              </Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!isView && (
            <Button type='button' onClick={handleGuardar} disabled={loadingDetail}>
              Guardar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
