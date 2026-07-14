import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { inputClass, labelClass } from '@/lib/form-styles'

export function ListagemLoteDirectAgregadosFilterControls({
  table,
}: {
  table: any
}) {
  const get = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string) ?? ''
  const set = (id: string, value: string) =>
    table.getColumn(id)?.setFilterValue(value)

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label className={labelClass}>Mês</Label>
        <Input
          className={inputClass}
          value={get('mes')}
          onChange={(e) => set('mes', e.target.value)}
          placeholder='1–12'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Ano</Label>
        <Input
          className={inputClass}
          value={get('ano')}
          onChange={(e) => set('ano', e.target.value)}
          placeholder='Ex.: 2026'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>N.º lote</Label>
        <Input
          className={inputClass}
          value={get('numerolote')}
          onChange={(e) => set('numerolote', e.target.value)}
          placeholder='Ex.: 12'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Código organismo (ULS)</Label>
        <Input
          className={inputClass}
          value={get('codigoorganismo')}
          onChange={(e) => set('codigoorganismo', e.target.value)}
          placeholder='Ex.: 19'
        />
      </div>
      <div className='space-y-2 sm:col-span-2'>
        <Label className={labelClass}>Tipo serviço</Label>
        <Input
          className={inputClass}
          value={get('tiposervico')}
          onChange={(e) => set('tiposervico', e.target.value)}
          placeholder='Ex.: 1'
        />
      </div>
    </div>
  )
}
