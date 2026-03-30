import { useState } from 'react'
import { UpdateInfo, AppUpdateDTO } from '@/types/api/responses'
import {
  Server,
  Monitor,
  Layers,
  ChevronRight,
  ChevronDown,
  Calendar,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download,
} from 'lucide-react'
import { updateService } from '@/lib/services/update/update.service'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

interface UpdateDialogProps {
  open: boolean
  update: UpdateInfo
  onOpenChange: (open: boolean) => void
}

const getUpdateTypeLabel = (type: number): string => {
  switch (type) {
    case 1:
      return 'API'
    case 2:
      return 'Aplicação'
    case 3:
      return 'Completa'
    default:
      return 'Atualização'
  }
}

const getUpdateTypeIcon = (type: number) => {
  switch (type) {
    case 1:
      return Server
    case 2:
      return Monitor
    case 3:
      return Layers
    default:
      return Download
  }
}

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Normalize an update DTO to handle different field names from API
 */
const normalizeUpdate = (upd: AppUpdateDTO): AppUpdateDTO => ({
  ...upd,
  updateVersion: upd.updateVersion ?? upd.version ?? null,
  updateDescription: upd.updateDescription ?? upd.description ?? null,
})

/**
 * Get the list of updates to display.
 */
const getUpdatesToDisplay = (update: UpdateInfo): AppUpdateDTO[] => {
  const updates = update.updatesDisponiveis ?? update.updates
  if (updates && updates.length > 0) {
    return [...updates]
      .sort((a, b) => {
        const vA = a.updateVersion ?? a.version ?? ''
        const vB = b.updateVersion ?? b.version ?? ''
        return vA.localeCompare(vB, undefined, { numeric: true })
      })
      .map(normalizeUpdate)
  }
  return [
    {
      updateId: update.updateId,
      updateVersion: update.updateVersion,
      updateType: update.updateType,
      isMandatory: update.isMandatory,
      updateDescription: update.updateDescription,
      releaseNotes: update.releaseNotes,
      releaseDate: update.releaseDate,
      ficheiroUpdateApi: update.ficheiroUpdateApi,
      tamanhoFicheiroApi: update.tamanhoFicheiroApi,
      hashFicheiroApi: update.hashFicheiroApi,
      ficheiroUpdateFrontend: update.ficheiroUpdateFrontend,
      tamanhoFicheiroFrontend: update.tamanhoFicheiroFrontend,
      hashFicheiroFrontend: update.hashFicheiroFrontend,
    },
  ]
}

/**
 * Calculate total file size from all updates
 */
const getTotalSize = (updates: AppUpdateDTO[]): number => {
  return updates.reduce((total, upd) => {
    return (
      total + (upd.tamanhoFicheiroApi ?? 0) + (upd.tamanhoFicheiroFrontend ?? 0)
    )
  }, 0)
}

export function UpdateDialog({
  open,
  update,
  onOpenChange,
}: UpdateDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const updates = getUpdatesToDisplay(update)
  const updateCount = updates.length
  const totalSize = getTotalSize(updates)
  const firstVersion = updates[0]?.updateVersion
  const lastVersion = updates[updates.length - 1]?.updateVersion

  const handleConfirm = async () => {
    setIsUpdating(true)
    setCurrentStep(1)
    setStatusMessage(
      updateCount > 1
        ? `A iniciar atualização 1 de ${updateCount}...`
        : 'A iniciar atualização...'
    )

    try {
      const trackingId = await updateService.startUpdate(update)

      setStatusMessage('A redirecionar para a página de atualização...')

      const returnUrl = window.location.origin + '/login'
      const updatingPageUrl = updateService.getUpdatingPageUrl(
        trackingId,
        returnUrl
      )
      window.location.href = updatingPageUrl
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a atualização.'
      toast.error(message)
      setStatusMessage(message)
      setIsUpdating(false)
      setCurrentStep(0)
    }
  }

  const handleCancel = () => {
    if (update.isMandatory) return
    onOpenChange(false)
  }

  if (!update?.hasUpdate) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0 gap-0 overflow-hidden'>
        {/* Header with gradient */}
        <div className='bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-xl bg-primary/10 border border-primary/20'>
                <Download className='h-6 w-6 text-primary' />
              </div>
              <div>
                <DialogTitle className='text-xl'>
                  {updateCount > 1
                    ? `${updateCount} atualizações disponíveis`
                    : 'Atualização disponível'}
                </DialogTitle>
                <DialogDescription className='mt-1'>
                  {update.isMandatory ? (
                    <span className='flex items-center gap-1.5 text-destructive'>
                      <AlertTriangle className='h-3.5 w-3.5' />
                      Atualização obrigatória
                    </span>
                  ) : (
                    'Recomendamos atualizar para a melhor experiência'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Version summary */}
          {updateCount > 1 && firstVersion && lastVersion && (
            <div className='mt-4 flex items-center justify-center gap-3 p-3 rounded-lg bg-background/80 border'>
              <div className='text-center'>
                <p className='text-xs text-muted-foreground'>De</p>
                <p className='font-mono font-semibold'>{firstVersion}</p>
              </div>
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
              <div className='text-center'>
                <p className='text-xs text-muted-foreground'>Para</p>
                <p className='font-mono font-semibold text-primary'>
                  {lastVersion}
                </p>
              </div>
              {totalSize > 0 && (
                <>
                  <div className='h-8 w-px bg-border mx-2' />
                  <div className='flex items-center gap-1.5 text-muted-foreground'>
                    <HardDrive className='h-3.5 w-3.5' />
                    <span className='text-sm'>{formatFileSize(totalSize)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Updates timeline */}
        <ScrollArea className='max-h-[45vh]'>
          <div className='p-4'>
            {updateCount === 1 ? (
              <SingleUpdateCard update={updates[0]} isOnly />
            ) : (
              <div className='space-y-0'>
                {updates.map((upd, index) => (
                  <UpdateTimelineItem
                    key={upd.updateId ?? index}
                    update={upd}
                    index={index}
                    isLast={index === updates.length - 1}
                    isCompleted={isUpdating && currentStep > index + 1}
                    isCurrent={isUpdating && currentStep === index + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className='border-t bg-muted/30 p-4'>
          {statusMessage && (
            <div className='mb-3'>
              <p className='text-sm text-muted-foreground mb-2'>
                {statusMessage}
              </p>
              {isUpdating && (
                <Progress value={isUpdating ? 50 : 0} className='h-1.5' />
              )}
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-2'>
            {!update.isMandatory && (
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Mais tarde
              </Button>
            )}
            <Button
              type='button'
              onClick={handleConfirm}
              disabled={isUpdating}
              className='gap-2'
            >
              {isUpdating ? (
                <>
                  <div className='h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                  A atualizar...
                </>
              ) : (
                <>
                  <Download className='h-4 w-4' />
                  {updateCount > 1
                    ? `Instalar ${updateCount} atualizações`
                    : 'Instalar atualização'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface UpdateTimelineItemProps {
  update: AppUpdateDTO
  index: number
  isLast: boolean
  isCompleted: boolean
  isCurrent: boolean
}

function UpdateTimelineItem({
  update,
  index,
  isLast,
  isCompleted,
  isCurrent,
}: UpdateTimelineItemProps) {
  const [isOpen, setIsOpen] = useState(index === 0)
  const Icon = getUpdateTypeIcon(update.updateType)
  const fileSize =
    (update.tamanhoFicheiroApi ?? 0) + (update.tamanhoFicheiroFrontend ?? 0)

  return (
    <div className='relative'>
      {/* Timeline line */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[19px] top-10 bottom-0 w-0.5',
            isCompleted ? 'bg-primary' : 'bg-border'
          )}
        />
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className='flex gap-3 items-start'>
          {/* Timeline dot */}
          <div
            className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0',
              isCompleted
                ? 'bg-primary border-primary text-primary-foreground'
                : isCurrent
                  ? 'bg-primary/10 border-primary text-primary animate-pulse'
                  : 'bg-background border-border text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className='h-5 w-5' />
            ) : (
              <Icon className='h-4 w-4' />
            )}
          </div>

          {/* Content */}
          <div className='flex-1 pb-4'>
            <CollapsibleTrigger className='flex items-center justify-between w-full text-left group min-h-[40px]'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-mono font-semibold'>
                  {update.updateVersion ?? `v${index + 1}`}
                </span>
                {update.isMandatory && (
                  <Badge
                    variant='destructive'
                    className='text-[10px] px-1.5 h-5'
                  >
                    Obrigatória
                  </Badge>
                )}
                <Badge variant='outline' className='text-[10px] px-1.5 h-5'>
                  {getUpdateTypeLabel(update.updateType)}
                </Badge>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground shrink-0'>
                {update.releaseDate && (
                  <span className='text-xs hidden sm:inline'>
                    {formatDate(update.releaseDate)}
                  </span>
                )}
                {isOpen ? (
                  <ChevronDown className='h-4 w-4 transition-transform' />
                ) : (
                  <ChevronRight className='h-4 w-4 transition-transform' />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-2'>
              <div className='rounded-lg border bg-card p-3 space-y-3'>
                {/* Meta info */}
                <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
                  {update.releaseDate && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(update.releaseDate)}
                    </div>
                  )}
                  {fileSize > 0 && (
                    <div className='flex items-center gap-1'>
                      <HardDrive className='h-3 w-3' />
                      {formatFileSize(fileSize)}
                    </div>
                  )}
                  <div className='flex items-center gap-1'>
                    <Icon className='h-3 w-3' />
                    {getUpdateTypeLabel(update.updateType)}
                  </div>
                </div>

                {/* Description */}
                {update.updateDescription && (
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-1'>
                      Descrição
                    </p>
                    <p className='text-sm'>{update.updateDescription}</p>
                  </div>
                )}

                {/* Release notes */}
                {update.releaseNotes && (
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-1'>
                      Notas de versão
                    </p>
                    <div className='whitespace-pre-wrap bg-muted/50 rounded-md p-2 max-h-32 overflow-y-auto font-mono text-xs'>
                      {update.releaseNotes}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>
    </div>
  )
}

interface SingleUpdateCardProps {
  update: AppUpdateDTO
  isOnly?: boolean
}

function SingleUpdateCard({ update }: SingleUpdateCardProps) {
  const Icon = getUpdateTypeIcon(update.updateType)
  const fileSize =
    (update.tamanhoFicheiroApi ?? 0) + (update.tamanhoFicheiroFrontend ?? 0)

  return (
    <div className='rounded-lg border bg-card p-4 space-y-4'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-primary/10'>
            <Icon className='h-5 w-5 text-primary' />
          </div>
          <div>
            <p className='font-mono font-semibold text-lg'>
              {update.updateVersion ?? 'Nova versão'}
            </p>
            <div className='flex items-center gap-2 mt-0.5'>
              <Badge variant='outline' className='text-xs'>
                {getUpdateTypeLabel(update.updateType)}
              </Badge>
              {update.isMandatory && (
                <Badge variant='destructive' className='text-xs'>
                  Obrigatória
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
        {update.releaseDate && (
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-4 w-4' />
            {formatDate(update.releaseDate)}
          </div>
        )}
        {fileSize > 0 && (
          <div className='flex items-center gap-1.5'>
            <HardDrive className='h-4 w-4' />
            {formatFileSize(fileSize)}
          </div>
        )}
      </div>

      {/* Description */}
      {update.updateDescription && (
        <div>
          <p className='text-sm font-medium mb-1'>Descrição</p>
          <p className='text-sm text-muted-foreground'>
            {update.updateDescription}
          </p>
        </div>
      )}

      {/* Release notes */}
      {update.releaseNotes && (
        <div>
          <p className='text-sm font-medium mb-1'>Notas de versão</p>
          <div className='text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3 max-h-40 overflow-y-auto'>
            {update.releaseNotes}
          </div>
        </div>
      )}
    </div>
  )
}
