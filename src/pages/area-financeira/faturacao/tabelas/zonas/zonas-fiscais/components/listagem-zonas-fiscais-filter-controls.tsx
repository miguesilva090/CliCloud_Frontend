import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemZonasFiscaisFilterControls({ table }: { table: any }) {
  const codigoDe =
    (table.getColumn('codigo')?.getFilterValue() as string) ?? ''
  const descricao =
    (table.getColumn('descricao')?.getFilterValue() as string) ?? ''

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>Código (de):</Label>
        <Input
          placeholder='De'
          value={codigoDe}
          onChange={(e) =>
            table.getColumn('codigo')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[200px] bg-background border border-input shadow-sm'
          inputMode='numeric'
        />
      </div>
      <div className='space-y-2'>
        <Label>Descrição:</Label>
        <Input
          placeholder='Procurar por descrição...'
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[280px] bg-background border border-input shadow-sm'
          maxLength={100}
        />
      </div>
    </div>
  )
}
