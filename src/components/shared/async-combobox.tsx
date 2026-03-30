import { useMemo, useState } from 'react'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput } from '@/components/ui/command'

export type ComboboxItem = {
  value: string
  label: string
  secondary?: string
}

export function AsyncCombobox({
  value,
  onChange,
  items,
  isLoading,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  searchValue,
  onSearchValueChange,
  className,
}: {
  value?: string
  onChange: (value: string) => void
  items: ComboboxItem[]
  isLoading?: boolean
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  searchValue: string
  onSearchValueChange: (value: string) => void
  /** Aplicado ao botão trigger (ex.: h-8 para altura mais baixa) */
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => items.find((i) => i.value === value),
    [items, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('h-8 w-full min-w-0 justify-between items-center py-1.5 overflow-hidden', className)}
          disabled={disabled}
        >
          {/* Texto sempre em uma linha, truncado, sem aumentar a altura da caixa */}
          <span
            className={cn(
              'block flex-1 min-w-0 truncate text-left',
              !selected?.label && 'text-muted-foreground'
            )}
          >
            {selected?.label || placeholder}
          </span>
          <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0'
        align='start'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder || 'Pesquisar…'}
            value={searchValue}
            onValueChange={onSearchValueChange}
          />
          {isLoading ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              A carregar…
            </div>
          ) : items.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              {emptyText || 'Sem resultados.'}
            </div>
          ) : (
            <div
              className='max-h-[300px] overflow-y-auto overflow-x-hidden p-1'
              role='listbox'
            >
              {items.map((item) => (
                <button
                  key={item.value}
                  type='button'
                  role='option'
                  aria-selected={value === item.value}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange(item.value)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='flex flex-col'>
                    <span className='text-sm'>{item.label}</span>
                    {item.secondary ? (
                      <span className='text-xs text-muted-foreground'>
                        {item.secondary}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

