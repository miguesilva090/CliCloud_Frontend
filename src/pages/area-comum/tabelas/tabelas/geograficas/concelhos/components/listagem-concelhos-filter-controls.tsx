import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

/** Painel de pesquisa da listagem de Concelhos: só Nome (De/Até) e checkbox Intervalo. A lupa pesquisa apenas por nome. */
export function ListagemConcelhosFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const nomeDe = (table.getColumn('nome')?.getFilterValue() as string) ?? ''
  const nomeAte = (table.getColumn('nomeFim')?.getFilterValue() as string) ?? ''
  const hasAteValues = !!nomeAte
  const [intervaloChecked, setIntervaloChecked] = useState(false)
  const intervalo = intervaloChecked || hasAteValues

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Nome:</Label>
        <Input
          placeholder='De...'
          value={nomeDe}
          onChange={(e) => table.getColumn('nome')?.setFilterValue(e.target.value)}
          className='w-full max-w-[240px] bg-background border border-input shadow-sm'
        />
        {intervalo && (
          <Input
            placeholder='Até...'
            value={nomeAte}
            onChange={(e) =>
              table.getColumn('nomeFim')?.setFilterValue(e.target.value)
            }
            className='w-full max-w-[240px] bg-background border border-input shadow-sm'
          />
        )}
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='intervalo-concelhos'
          checked={intervalo}
          onCheckedChange={(checked) => {
            setIntervaloChecked(!!checked)
            if (!checked) {
              table.getColumn('nomeFim')?.setFilterValue('')
            }
          }}
        />
        <label
          htmlFor='intervalo-concelhos'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          Intervalo
        </label>
      </div>
    </div>
  )
}

