import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemNaturezaDocumentoFilterControls({
  table,
}: {
  table: any
}) {
  const sigla = (table.getColumn('sigla')?.getFilterValue() as string) ?? ''
  const descricao = (table.getColumn('descricao')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Sigla:</Label>
        <Input
          placeholder='Procurar por sigla...'
          value={sigla}
          onChange={(e) => table.getColumn('sigla')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
          maxLength={1}
        />
      </div>
      <div className='space-y-2'>
        <Label>Descrição:</Label>
        <Input
          placeholder='Procurar por descrição...'
          value={descricao}
          onChange={(e) => table.getColumn('descricao')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
