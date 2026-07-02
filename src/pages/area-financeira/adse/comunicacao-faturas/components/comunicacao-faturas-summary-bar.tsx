import type { ComunicacaoFaturasTotaisDTO } from '@/types/dtos/faturacao/comunicacao-faturas.dtos'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  totais: ComunicacaoFaturasTotaisDTO
  statusMessage?: string | null
  statusTone?: 'warning' | 'error'
}

function formatTotal(value: number): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function ComunicacaoFaturasSummaryBar({
  totais,
  statusMessage,
  statusTone = 'warning',
}: Props) {
  return (
    <section className='space-y-3 border-t border-border/70 pt-3'>
      {statusMessage ? (
        <p
          className={
            statusTone === 'error'
              ? 'text-sm font-medium text-red-600'
              : 'text-sm font-medium text-amber-600'
          }
        >
          {statusMessage}
        </p>
      ) : null}

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Total FR(Pág)</Label>
          <Input
            readOnly
            className='h-9 bg-muted/40 text-right tabular-nums'
            value={formatTotal(totais.totalFrPagina)}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Total FR</Label>
          <Input
            readOnly
            className='h-9 bg-muted/40 text-right tabular-nums'
            value={formatTotal(totais.totalFr)}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>
            Total ADSE(Pág)
          </Label>
          <Input
            readOnly
            className='h-9 bg-muted/40 text-right tabular-nums'
            value={formatTotal(totais.totalAdsePagina)}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Total ADSE</Label>
          <Input
            readOnly
            className='h-9 bg-muted/40 text-right tabular-nums'
            value={formatTotal(totais.totalAdse)}
          />
        </div>
      </div>
    </section>
  )
}
