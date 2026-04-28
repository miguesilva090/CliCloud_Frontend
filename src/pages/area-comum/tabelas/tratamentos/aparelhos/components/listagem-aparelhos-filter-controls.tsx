import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemAparelhosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const local = (table.getColumn('local')?.getFilterValue() as string) ?? ''
  const tipo = (table.getColumn('tipoAparelhoDesignacao')?.getFilterValue() as string) ?? ''
  const marca = (table.getColumn('marcaAparelhoDesignacao')?.getFilterValue() as string) ?? ''
  const modelo = (table.getColumn('modeloAparelhoDesignacao')?.getFilterValue() as string) ?? ''
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Tipo:</Label>
        <Input placeholder='Procurar tipo...' value={tipo} onChange={(e) => table.getColumn('tipoAparelhoDesignacao')?.setFilterValue(e.target.value)} className='w-full max-w-[240px] bg-background border border-input shadow-sm' />
      </div>
      <div className='space-y-2'>
        <Label>Marca:</Label>
        <Input placeholder='Procurar marca...' value={marca} onChange={(e) => table.getColumn('marcaAparelhoDesignacao')?.setFilterValue(e.target.value)} className='w-full max-w-[240px] bg-background border border-input shadow-sm' />
      </div>
      <div className='space-y-2'>
        <Label>Modelo:</Label>
        <Input placeholder='Procurar modelo...' value={modelo} onChange={(e) => table.getColumn('modeloAparelhoDesignacao')?.setFilterValue(e.target.value)} className='w-full max-w-[240px] bg-background border border-input shadow-sm' />
      </div>
      <div className='space-y-2'>
        <Label>Local:</Label>
        <Input placeholder='Procurar local...' value={local} onChange={(e) => table.getColumn('local')?.setFilterValue(e.target.value)} className='w-full max-w-[240px] bg-background border border-input shadow-sm' />
      </div>
    </div>
  )
}
