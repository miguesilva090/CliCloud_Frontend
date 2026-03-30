import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * Painel de pesquisa da listagem de Tipos de Entidade:
 * - Sigla (De/Até) e checkbox Intervalo.
 * A lupa pesquisa apenas por sigla.
 */
export function ListagemTiposEntidadeFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const siglaDe = (table.getColumn('sigla')?.getFilterValue() as string) ?? ''
  const siglaAte =
    (table.getColumn('siglaFim')?.getFilterValue() as string) ?? ''
  const hasAteValues = !!siglaAte
  const [intervaloChecked, setIntervaloChecked] = useState(false)
  const intervalo = intervaloChecked || hasAteValues

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Sigla:</Label>
        <Input
          placeholder='De...'
          value={siglaDe}
          onChange={(e) => table.getColumn('sigla')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
        {intervalo && (
          <Input
            placeholder='Até...'
            value={siglaAte}
            onChange={(e) =>
              table.getColumn('siglaFim')?.setFilterValue(e.target.value)
            }
            className='w-full max-w-[240px] bg-background border border-input shadow-sm'
          />
        )}
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='intervalo-tipos-entidade'
          checked={intervalo}
          onCheckedChange={(checked) => {
            setIntervaloChecked(!!checked)
            if (!checked) {
              table.getColumn('siglaFim')?.setFilterValue('')
            }
          }}
        />
        <label
          htmlFor='intervalo-tipos-entidade'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          Intervalo
        </label>
      </div>
    </div>
  )
}

