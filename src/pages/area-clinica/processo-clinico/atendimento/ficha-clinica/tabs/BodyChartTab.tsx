import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import state from '@/states/state'
import { toFullUrl } from '@/utils/image-url-helpers'
import type {
  MapaBodyChartLightDTO,
  NotasBodyChartDTO,
} from '@/types/dtos/processo-clinico/body-chart.dtos'
import {
  useDeleteMultipleNotasBodyChart,
  useMapaBodyChartLight,
  useNotasBodyChartByMapa,
  useSaveNotaBodyChart,
  useMapaBodyChartById,
} from '../queries/body-chart-queries'

type BodyChartTabProps = {
  selectedMapaId?: string | null
  onSelectedMapaChange?: (id: string) => void
  tratamentoId: string
}

type MarkerFormState = {
  id?: string
  nome: string
  descricao: string
  marcadorBodyChartId: string
}

const DEFAULT_MARCADOR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

export function BodyChartTab({
  selectedMapaId,
  onSelectedMapaChange,
  tratamentoId,
}: BodyChartTabProps) {
  const [currentMapaId, setCurrentMapaId] = useState<string | undefined>(
    selectedMapaId ?? undefined,
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogPosition, setDialogPosition] = useState<{ xPercent: number; yPercent: number } | null>(
    null,
  )
  const [formState, setFormState] = useState<MarkerFormState>({
    nome: '',
    descricao: '',
    marcadorBodyChartId: '',
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { data: mapas = [], isLoading: loadingMapas } = useMapaBodyChartLight()
  const { data: notas = [], isLoading: loadingNotas } = useNotasBodyChartByMapa(currentMapaId, tratamentoId)
  const saveMutation = useSaveNotaBodyChart(currentMapaId, tratamentoId)
  const deleteMultipleMutation = useDeleteMultipleNotasBodyChart(currentMapaId)

  const selectedMapa: MapaBodyChartLightDTO | undefined = useMemo(
    () => mapas.find((m) => m.id === currentMapaId),
    [mapas, currentMapaId],
  )

  const { data: selectedMapaDetail } = useMapaBodyChartById(currentMapaId)
  const markerTypes = selectedMapaDetail?.marcadores ?? []

  const selectedMapaImageUrl =
    selectedMapa?.caminhoImagem
      ? toFullUrl(selectedMapa.caminhoImagem, state.URL) ?? selectedMapa.caminhoImagem
      : undefined

  const handleChangeMapa = (id: string) => {
    setCurrentMapaId(id)
    setSelectedIds(new Set())
    if (onSelectedMapaChange) onSelectedMapaChange(id)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!currentMapaId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100

    setDialogPosition({ xPercent, yPercent })
    const defaultMarkerId =
      markerTypes[0]?.id ?? DEFAULT_MARCADOR_ID

    setFormState({
      id: undefined,
      nome: '',
      descricao: '',
      marcadorBodyChartId: defaultMarkerId,
    })
    setDialogOpen(true)
  }

  const handleMarkerClick = (nota: NotasBodyChartDTO) => {
    setDialogPosition({ xPercent: nota.xPercent, yPercent: nota.yPercent })
    setFormState({
      id: nota.id,
      nome: nota.nome ?? '',
      descricao: nota.descricao ?? '',
      marcadorBodyChartId: nota.marcadorBodyChartId,
    })
    setDialogOpen(true)
  }

  const handleToggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSaveMarker = async () => {
    if (!currentMapaId || !dialogPosition) return
    const markerIdToUse =
      formState.marcadorBodyChartId || markerTypes[0]?.id || DEFAULT_MARCADOR_ID
    const payload = {
      existingId: formState.id,
      data: {
        tratamentoId,
        nome: formState.nome,
        descricao: formState.descricao,
        xPercent: dialogPosition.xPercent,
        yPercent: dialogPosition.yPercent,
        marcadorBodyChartId: markerIdToUse,
      },
    }
    await saveMutation.mutateAsync(payload)
    setDialogOpen(false)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    const body = { ids: Array.from(selectedIds) }
    await deleteMultipleMutation.mutateAsync(body)
    setSelectedIds(new Set())
  }

  return (
    <div className='mt-3 flex h-full flex-col gap-3 rounded-md border bg-muted/10 p-3 text-xs'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-muted-foreground'>Body Chart</span>
          <Select
            value={currentMapaId}
            onValueChange={handleChangeMapa}
            disabled={loadingMapas}
          >
            <SelectTrigger className='h-8 w-56'>
              <SelectValue placeholder='Selecione o mapa corporal' />
            </SelectTrigger>
            <SelectContent>
              {mapas.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome ?? m.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='destructive'
            disabled={selectedIds.size === 0 || deleteMultipleMutation.isPending}
            onClick={handleDeleteSelected}
          >
            Eliminar notas selecionadas
          </Button>
        </div>
      </div>

      <div className='grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <div className='flex flex-col items-center justify-center rounded-md border bg-background'>
          {selectedMapaImageUrl && selectedMapa ? (
            <div className='relative flex w-full max-w-[920px] items-center justify-center overflow-auto rounded-md px-2 pb-3 pt-1'>
              <div className='relative' style={{ minHeight: 640 }}>
                <img
                  src={selectedMapaImageUrl}
                  alt={selectedMapa.nome ?? 'Body chart'}
                  className='max-h-[72vh] min-h-[580px] w-auto max-w-full cursor-crosshair object-contain'
                  onClick={handleImageClick}
                />
                {notas.map((nota) => {
                    const color = nota.marcadorBodyChart?.corHex
                    const isSelected = selectedIds.has(nota.id)
                    return (
                    <button
                      key={nota.id}
                      type='button'
                      className={cn(
                        'absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold text-white shadow-md',
                        !color && (isSelected ? 'bg-primary' : 'bg-sky-600'),
                      )}
                      style={{
                        left: `${nota.xPercent}%`,
                        top: `${nota.yPercent}%`,
                        backgroundColor: color ?? undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkerClick(nota)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleToggleSelected(nota.id)
                      }}
                    >
                      {notas.findIndex((n) => n.id === nota.id) + 1}
                    </button>
                  )})}
              </div>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>
              Selecione um mapa corporal para adicionar marcadores.
            </p>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <span className='mb-1 block text-[11px] font-semibold uppercase text-muted-foreground'>
            Notas associadas
          </span>
          <div className='h-[260px] space-y-1 overflow-y-auto rounded-md border bg-background p-2'>
            {loadingNotas && <p className='text-xs text-muted-foreground'>A carregar notas...</p>}
            {!loadingNotas && notas.length === 0 && (
              <p className='text-xs text-muted-foreground'>Nenhuma nota ainda para este mapa.</p>
            )}
            {notas.map((nota, index) => (
              <div
                key={nota.id}
                className={cn(
                  'flex items-start justify-between gap-2 rounded border px-2 py-1 text-[11px]',
                  selectedIds.has(nota.id) ? 'border-primary bg-primary/5' : 'bg-muted/40',
                )}
              >
                <div
                  className='min-w-0 flex-1 cursor-pointer'
                  onClick={() => handleMarkerClick(nota)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMarkerClick(nota)}
                >
                  <div className='flex items-center gap-1 font-semibold'>
                    <span className='inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[9px] text-white'>
                      {index + 1}
                    </span>
                    <span>{nota.nome ?? '(sem título)'}</span>
                  </div>
                  {nota.descricao && (
                    <p className='mt-0.5 text-[10px] text-muted-foreground'>{nota.descricao}</p>
                  )}
                </div>
                <label className='flex cursor-pointer items-center pt-0.5'>
                  <input
                    type='checkbox'
                    className='h-4 w-4'
                    checked={selectedIds.has(nota.id)}
                    onChange={() => handleToggleSelected(nota.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </div>
            ))}
          </div>

          {markerTypes.length > 0 && (
            <div className='mt-2 rounded-md border bg-muted/40 p-2'>
              <span className='mb-1 block text-[11px] font-semibold uppercase text-muted-foreground'>
                Legenda
              </span>
              <div className='flex flex-wrap gap-2'>
                {markerTypes.map((m) => (
                  <div key={m.id} className='flex items-center gap-1 text-[11px]'>
                    <span
                      className='inline-block h-3 w-3 rounded-full border'
                      style={{ backgroundColor: m.corHex }}
                    />
                    <span>{m.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>{formState.id ? 'Editar marcador' : 'Adicionar marcador'}</DialogTitle>
          </DialogHeader>

          <div className='space-y-3 text-xs'>
            <div>
              <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                Título
              </span>
              <Input
                value={formState.nome}
                onChange={(e) => setFormState((s) => ({ ...s, nome: e.target.value }))}
                placeholder='Título da nota'
              />
            </div>

            <div>
              <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                Descrição
              </span>
              <Textarea
                value={formState.descricao}
                onChange={(e) => setFormState((s) => ({ ...s, descricao: e.target.value }))}
                rows={4}
                placeholder='Descrição...'
              />
            </div>

            <div>
              <span className='mb-1 block text-[11px] font-medium text-muted-foreground'>
                Tipo de marcador
              </span>
              <Select
                value={formState.marcadorBodyChartId}
                onValueChange={(value) =>
                  setFormState((s) => ({ ...s, marcadorBodyChartId: value }))
                }
              >
                <SelectTrigger className='h-8'>
                  <SelectValue placeholder='Selecione o tipo de marcador' />
                </SelectTrigger>
                <SelectContent>
                  {markerTypes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='mt-4 flex gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSaveMarker}
              disabled={saveMutation.isPending || !formState.marcadorBodyChartId}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


