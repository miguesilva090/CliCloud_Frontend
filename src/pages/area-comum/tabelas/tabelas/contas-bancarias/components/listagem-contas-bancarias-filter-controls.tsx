import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemContasBancariasFilterControls({
  table,
}: {
  table: any
}) {
  const numero = (table.getColumn('numero')?.getFilterValue() as string) ?? ''
  const tipoConta =
    (table.getColumn('tipoConta')?.getFilterValue() as string) ?? ''
  const bancoNome =
    (table.getColumn('bancoNome')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Número:</Label>
        <Input
          placeholder='Procurar por número...'
          value={numero}
          onChange={(e) =>
            table.getColumn('numero')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Tipo de conta:</Label>
        <Input
          placeholder='Procurar por tipo...'
          value={tipoConta}
          onChange={(e) =>
            table.getColumn('tipoConta')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
      <div className='space-y-2'>
        <Label>Instituição financeira:</Label>
        <Input
          placeholder='Procurar por banco...'
          value={bancoNome}
          onChange={(e) =>
            table.getColumn('bancoNome')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
      </div>
    </div>
  )
}
