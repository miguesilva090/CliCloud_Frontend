import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DateField } from '@/components/shared/date-field'
import { inputClass, labelClass } from '@/lib/form-styles'

export function ListagemLoteDirectFilterControls({ table }: { table: any }) {
  const get = (id: string) => (table.getColumn(id)?.getFilterValue() as string) ?? ''
  const set = (id: string, value: string) => table.getColumn(id)?.setFilterValue(value)

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label className={labelClass}>Cód. utente de</Label>
        <Input
          className={inputClass}
          value={get('utentenumero_de')}
          onChange={(e) => set('utentenumero_de', e.target.value)}
          placeholder='De'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Cód. utente até</Label>
        <Input
          className={inputClass}
          value={get('utentenumero_ate')}
          onChange={(e) => set('utentenumero_ate', e.target.value)}
          placeholder='Até'
        />
      </div>
      <div className='space-y-2 sm:col-span-2'>
        <Label className={labelClass}>Nome utente</Label>
        <Input
          className={inputClass}
          value={get('utentenome')}
          onChange={(e) => set('utentenome', e.target.value)}
          placeholder='Contém…'
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Data fim de</Label>
        <DateField
          className={inputClass}
          value={get('datafim_de')}
          onChange={(value) => set('datafim_de', value)}
        />
      </div>
      <div className='space-y-2'>
        <Label className={labelClass}>Data fim até</Label>
        <DateField
          className={inputClass}
          value={get('datafim_ate')}
          onChange={(value) => set('datafim_ate', value)}
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
    </div>
  )
}
