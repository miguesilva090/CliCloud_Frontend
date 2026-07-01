import type { ComunicacaoFaturasModoListagem } from '@/types/dtos/faturacao/comunicacao-faturas.dtos'
import {
  Check,
  CloudUpload,
  FolderOpen,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  modoListagem: ComunicacaoFaturasModoListagem
  onModoListagemChange: (modo: ComunicacaoFaturasModoListagem) => void
  numeroPreFatura: string
  onNumeroPreFaturaChange: (value: string) => void
  preFaturasOpcoes: Array<{ value: string; label: string }>
  onRefreshPreFaturas: () => void
  onOpenPreFaturas: () => void
  onValidar: () => void
  onComunicar: () => void
  onEliminar: () => void
  onLibertar: () => void
  statusMessage?: string | null
  isRefreshing?: boolean
  actionsDisabled?: boolean
}

export function ComunicacaoFaturasActionBar({
  modoListagem,
  onModoListagemChange,
  numeroPreFatura,
  onNumeroPreFaturaChange,
  preFaturasOpcoes,
  onRefreshPreFaturas,
  onOpenPreFaturas,
  onValidar,
  onComunicar,
  onEliminar,
  onLibertar,
  statusMessage,
  isRefreshing = false,
  actionsDisabled = false,
}: Props) {
  const isDevolucoes = modoListagem === 'devolucoes'

  return (
    <div className='space-y-2 border-b border-border/70 pb-3'>
      <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            size='sm'
            variant={!isDevolucoes ? 'default' : 'outline'}
            className={cn(
              'h-8 gap-2',
              !isDevolucoes
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border-primary text-primary hover:bg-primary/10'
            )}
            onClick={onOpenPreFaturas}
          >
            <FolderOpen className='h-4 w-4' />
            Pré-Faturas
          </Button>
          <Button
            type='button'
            size='sm'
            variant={isDevolucoes ? 'default' : 'outline'}
            className={cn(
              'h-8 gap-2',
              isDevolucoes
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : undefined
            )}
            onClick={() =>
              onModoListagemChange(isDevolucoes ? 'pre-faturas' : 'devolucoes')
            }
          >
            {isDevolucoes ? (
              <Check className='h-4 w-4' />
            ) : (
              <RotateCcw className='h-4 w-4' />
            )}
            Devoluções
          </Button>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-2'>
            <Label className='shrink-0 text-xs text-muted-foreground'>
              N. Pré Fatura
            </Label>
            <Select
              value={numeroPreFatura || '__none__'}
              onValueChange={(value) =>
                onNumeroPreFaturaChange(value === '__none__' ? '' : value)
              }
            >
              <SelectTrigger className='h-8 w-[min(12rem,40vw)]'>
                <SelectValue placeholder='N. Pré Fatura' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>—</SelectItem>
                {preFaturasOpcoes.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              size='icon'
              variant='outline'
              className='h-8 w-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
              title='Atualizar pré-faturas'
              onClick={onRefreshPreFaturas}
              disabled={isRefreshing}
            >
              <RotateCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
          </div>

          <Button
            type='button'
            size='sm'
            className='h-8 gap-2'
            onClick={onValidar}
            disabled={actionsDisabled}
          >
            <Check className='h-4 w-4' />
            Validar
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-8 gap-2 bg-teal-600 text-white hover:bg-teal-700'
            onClick={onComunicar}
            disabled={actionsDisabled}
          >
            <CloudUpload className='h-4 w-4' />
            Comunicar
          </Button>
          <Button
            type='button'
            size='sm'
            variant='destructive'
            className='h-8 gap-2'
            onClick={onEliminar}
            disabled={actionsDisabled}
          >
            <X className='h-4 w-4' />
            Eliminar
          </Button>
          {isDevolucoes ? (
            <Button
              type='button'
              size='sm'
              className='h-8 gap-2 bg-amber-500 text-white hover:bg-amber-600'
              onClick={onLibertar}
              disabled={actionsDisabled}
            >
              <Undo2 className='h-4 w-4' />
              Libertar
            </Button>
          ) : null}
        </div>
      </div>

      {statusMessage ? (
        <p
          className={cn(
            'text-sm font-medium',
            isDevolucoes ? 'text-red-600' : 'text-amber-600'
          )}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  )
}
