import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * Painel de pesquisa da listagem de Códigos Postais:
 * - Código (De/Até) e checkbox Intervalo.
 * A lupa pesquisa apenas por código.
 */
export function ListagemCodigosPostaisFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const codigoDe = (table.getColumn('codigo')?.getFilterValue() as string) ?? ''
  const codigoAte =
    (table.getColumn('codigoFim')?.getFilterValue() as string) ?? ''
  const hasAteValues = !!codigoAte
  const [intervaloChecked, setIntervaloChecked] = useState(false)
  const intervalo = intervaloChecked || hasAteValues

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Código:</Label>
        <Input
          placeholder='De...'
          value={codigoDe}
          onChange={(e) => table.getColumn('codigo')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
        {intervalo && (
          <Input
            placeholder='Até...'
            value={codigoAte}
            onChange={(e) =>
              table.getColumn('codigoFim')?.setFilterValue(e.target.value)
            }
            className='w-full max-w-[240px] bg-background border border-input shadow-sm'
          />
        )}
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='intervalo-codigospostais'
          checked={intervalo}
          onCheckedChange={(checked) => {
            setIntervaloChecked(!!checked)
            if (!checked) {
              table.getColumn('codigoFim')?.setFilterValue('')
            }
          }}
        />
        <label
          htmlFor='intervalo-codigospostais'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          Intervalo
        </label>
      </div>
    </div>
  )
}

