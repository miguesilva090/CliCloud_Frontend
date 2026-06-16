import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export function ListagemModosPagamentoFilterControls({
  table,
  mostrarHistorico,
  onMostrarHistoricoChange,
}: {
  table: any
  mostrarHistorico: boolean
  onMostrarHistoricoChange: (value: boolean) => void
}) {
  const descricao =
    (table.getColumn('descricao')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Descrição:</Label>
        <Input
          placeholder='Procurar por descrição...'
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[280px] bg-background border border-input shadow-sm'
          maxLength={50}
        />
      </div>
      <div className='flex items-center gap-2'>
        <Checkbox
          id='modo-pagamento-historico'
          checked={mostrarHistorico}
          onCheckedChange={(checked) =>
            onMostrarHistoricoChange(checked === true)
          }
        />
        <Label htmlFor='modo-pagamento-historico' className='font-normal'>
          Mostrar apenas histórico
        </Label>
      </div>
    </div>
  )
}
