import type React from 'react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MapasBodyChartFilterControlsProps {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}

export const MapasBodyChartFilterControls: React.FC<
  MapasBodyChartFilterControlsProps
> = ({ table, onApplyFilters, onClearFilters }) => {
  const [nomeFilter, setNomeFilter] = useState('')

  useEffect(() => {
    const currentFilter = table
      .getState()
      .columnFilters?.find((f: { id: string }) => f.id === 'nome')
    if (currentFilter) {
      setNomeFilter(String(currentFilter.value ?? ''))
    } else {
      setNomeFilter('')
    }
  }, [table])

  const handleApply = () => {
    table.getColumn('nome')?.setFilterValue(nomeFilter || undefined)
    onApplyFilters()
  }

  const handleClear = () => {
    setNomeFilter('')
    table.getColumn('nome')?.setFilterValue(undefined)
    onClearFilters()
  }

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-end'>
      <div className='flex-1'>
        <label className='mb-1 block text-xs font-medium text-muted-foreground'>
          Título
        </label>
        <Input
          value={nomeFilter}
          onChange={(e) => setNomeFilter(e.target.value)}
          placeholder='Procurar por título...'
        />
      </div>
      <div className='flex gap-2'>
        <Button type='button' variant='default' onClick={handleApply}>
          Aplicar
        </Button>
        <Button type='button' variant='outline' onClick={handleClear}>
          Limpar
        </Button>
      </div>
    </div>
  )
}

