import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { inputClass, labelClass } from '@/lib/form-styles'

export function ListagemCredenciaisSnsFilterControls({ table }: { table: any }) {
  const get = (id: string) => (table.getColumn(id)?.getFilterValue() as string) ?? ''
  const set = (id: string, value: string) => table.getColumn(id)?.setFilterValue(value)

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label className={labelClass}>Data lote de</Label>
        <Input
          type='date'
          className={inputClass}
          value={get('datalotede')}
          onChange={(e) => set('datalotede', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Data lote até</Label>
        <Input
          type='date'
          className={inputClass}
          value={get('dataloteate')}
          onChange={(e) => set('dataloteate', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>N.º lote de</Label>
        <Input
          className={inputClass}
          value={get('numerolotede')}
          onChange={(e) => set('numerolotede', e.target.value)}
          placeholder='De'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>N.º lote até</Label>
        <Input
          className={inputClass}
          value={get('numeroloteate')}
          onChange={(e) => set('numeroloteate', e.target.value)}
          placeholder='Até'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Cód. organismo de</Label>
        <Input
          className={inputClass}
          value={get('codigoorganismode')}
          onChange={(e) => set('codigoorganismode', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Cód. organismo até</Label>
        <Input
          className={inputClass}
          value={get('codigoorganismoate')}
          onChange={(e) => set('codigoorganismoate', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Ano de</Label>
        <Input
          className={inputClass}
          value={get('anode')}
          onChange={(e) => set('anode', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Ano até</Label>
        <Input
          className={inputClass}
          value={get('anoate')}
          onChange={(e) => set('anoate', e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Mês de</Label>
        <Input
          className={inputClass}
          value={get('mesde')}
          onChange={(e) => set('mesde', e.target.value)}
          placeholder='1–12'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Mês até</Label>
        <Input
          className={inputClass}
          value={get('mesate')}
          onChange={(e) => set('mesate', e.target.value)}
          placeholder='1–12'
        />
      </div>
    </div>
  )
}
