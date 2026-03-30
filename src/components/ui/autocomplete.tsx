import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup } from './command'
import { Input } from './input'

export type AutocompleteOption = {
  value: string
  label: string
}

interface AutocompleteProps {
  options: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  createOption?: (inputValue: string) => {
    value: string
    label: string
    inputValue: string
  }
  onCreateOption?: (inputValue: string) => void
  defaultVisibleCount?: number
  autoFocus?: boolean
  initialInputValue?: string
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção',
  emptyText = 'Nenhuma opção encontrada.',
  disabled = false,
  className,
  createOption,
  onCreateOption,
  defaultVisibleCount = 5,
  autoFocus = false,
  initialInputValue,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(initialInputValue || '')
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const [isTyping, setIsTyping] = React.useState(false)
  const [isCreationConfirmed, setIsCreationConfirmed] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  // Show all options when opened via click or input is empty, filter when typing and input is not empty
  const filteredOptions =
    isTyping && inputValue !== ''
      ? options
          .filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          )
          .sort((a, b) => {
            const searchTerm = inputValue.toLowerCase()
            const aLabel = a.label.toLowerCase()
            const bLabel = b.label.toLowerCase()

            // Exact match gets highest priority
            const aExact = aLabel === searchTerm
            const bExact = bLabel === searchTerm
            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1

            // Starts with gets second priority
            const aStartsWith = aLabel.startsWith(searchTerm)
            const bStartsWith = bLabel.startsWith(searchTerm)
            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1

            // Then sort by position of match (earlier match = higher priority)
            const aIndex = aLabel.indexOf(searchTerm)
            const bIndex = bLabel.indexOf(searchTerm)
            if (aIndex !== bIndex) return aIndex - bIndex

            // Finally, sort alphabetically
            return aLabel.localeCompare(bLabel)
          })
          .slice(0, 3) // Limit to 3 options when typing and input is not empty
      : options.slice(0, defaultVisibleCount) // Show first N options when opened via click or input is empty

  const showCreateOption =
    createOption &&
    inputValue &&
    !filteredOptions.some(
      (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
    ) &&
    !selectedOption // Don't show create option if an option is already selected

  React.useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label)
      // Reset creation confirmed when an actual option is selected
      setIsCreationConfirmed(false)
    } else if (!value || value === '') {
      // If we have an initialInputValue and no value, keep showing it
      if (initialInputValue && !selectedOption) {
        setInputValue(initialInputValue)
      } else if (!createOption) {
        // Only clear inputValue when value becomes empty if createOption is not enabled
        // If createOption is enabled, preserve the inputValue to allow creating new options
        setInputValue('')
        setIsCreationConfirmed(false)
      }
      // If createOption is enabled, don't clear inputValue - preserve what user typed
    }
  }, [selectedOption, value, initialInputValue, createOption])

  // Set initial input value when provided
  React.useEffect(() => {
    if (initialInputValue && !selectedOption && (!value || value === '')) {
      setInputValue(initialInputValue)
    }
  }, [initialInputValue, selectedOption, value])

  // Handle clicks outside the component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !document.querySelector('.autocomplete-dropdown')?.contains(target)
      ) {
        setIsOpen(false)
        setIsTyping(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (selectedValue: string) => {
    const option = options.find((opt) => opt.label === selectedValue)
    if (option) {
      onValueChange(option.value)
      setInputValue(option.label)
      setIsCreationConfirmed(false)
    } else if (onCreateOption) {
      onCreateOption(inputValue)
      setIsCreationConfirmed(true)
    }
    setIsOpen(false)
    setHighlightedIndex(-1)
    setIsTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (
        isOpen &&
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        handleSelect(filteredOptions[highlightedIndex].label)
      } else if (isOpen && filteredOptions.length === 1) {
        // If there's only one option, select it
        handleSelect(filteredOptions[0].label)
      } else if (createOption && inputValue) {
        // If custom values are allowed, use the current input value
        if (onCreateOption) {
          onCreateOption(inputValue)
          setIsCreationConfirmed(true)
          setIsOpen(false)
          setHighlightedIndex(-1)
          setIsTyping(false)
        }
      }
    } else if (e.key === 'Tab') {
      // Only handle Tab for selection when dropdown is open and showing options
      if (isOpen && (filteredOptions.length > 0 || showCreateOption)) {
        e.preventDefault()
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex].label)
        } else if (filteredOptions.length === 1) {
          // If there's only one option, select it
          handleSelect(filteredOptions[0].label)
        } else if (showCreateOption && inputValue) {
          // If custom values are allowed, use the current input value
          if (onCreateOption) {
            onCreateOption(inputValue)
            setIsCreationConfirmed(true)
            setIsOpen(false)
            setHighlightedIndex(-1)
            setIsTyping(false)
          }
        }
      }
      // If dropdown is not open or no options, let Tab work normally for navigation
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setHighlightedIndex(-1)
      setIsTyping(false)
    }
  }

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true)
      setIsTyping(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    }
  }

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setIsTyping(false)
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <div className='relative' ref={containerRef}>
          <div className='relative'>
            <Input
              ref={inputRef}
              disabled={disabled}
              placeholder={placeholder}
              value={inputValue}
              onClick={handleInputClick}
              autoFocus={autoFocus}
              onChange={(e) => {
                const newValue = e.target.value
                setInputValue(newValue)
                setIsTyping(true)
                setIsOpen(true)
                setHighlightedIndex(-1)
                setIsCreationConfirmed(false)

                if (!newValue) {
                  onValueChange('')
                } else if (createOption) {
                  onValueChange(newValue)
                }
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  const activeElement = document.activeElement
                  const dropdownElement = document.querySelector(
                    '.autocomplete-dropdown'
                  )
                  if (dropdownElement?.contains(activeElement)) {
                    return
                  }
                  setIsOpen(false)
                  setIsTyping(false)
                  if (!createOption && selectedOption) {
                    setInputValue(selectedOption.label)
                  }
                }, 100)
              }}
              className={cn('w-full pr-10', className)}
            />
            {showCreateOption && !isCreationConfirmed ? (
              <X
                className={cn(
                  'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform',
                  'text-destructive' // Red X when doesn't exist
                )}
              />
            ) : isCreationConfirmed ? (
              <Plus
                className={cn(
                  'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform',
                  'text-emerald-500' // Green plus when creation confirmed
                )}
              />
            ) : (
              <Check
                className={cn(
                  'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform',
                  selectedOption
                    ? 'text-emerald-500' // Green checkmark when selected
                    : 'text-muted-foreground' // Default color
                )}
              />
            )}
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='start'
          sideOffset={4}
          className='z-[9999] w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover p-0 shadow-md outline-none autocomplete-dropdown'
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Prevent immediate closing when clicking outside
            e.preventDefault()
          }}
        >
          <Command className='overflow-hidden rounded-md' shouldFilter={false}>
            {filteredOptions.length === 0 && !showCreateOption ? (
              <CommandEmpty className='py-6 text-center text-sm text-muted-foreground'>
                {emptyText}
              </CommandEmpty>
            ) : (
              <CommandGroup className='max-h-[300px] overflow-auto p-1'>
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-sm',
                      'transition-colors hover:bg-accent hover:text-accent-foreground',
                      highlightedIndex === index &&
                        'bg-accent text-accent-foreground'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelect(option.label)
                      inputRef.current?.focus()
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.label}
                  </div>
                ))}
                {showCreateOption && (
                  <div
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-sm',
                      'transition-colors hover:bg-accent hover:text-accent-foreground',
                      highlightedIndex === filteredOptions.length &&
                        'bg-accent text-accent-foreground'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (onCreateOption) {
                        onCreateOption(inputValue)
                        setIsCreationConfirmed(true)
                      }
                      inputRef.current?.focus()
                    }}
                    onMouseEnter={() =>
                      setHighlightedIndex(filteredOptions.length)
                    }
                  >
                    <div className='flex flex-col'>
                      <span>Criar: "{inputValue}"</span>
                      <span className='text-xs text-muted-foreground'>
                        Pressione Enter para criar
                      </span>
                    </div>
                  </div>
                )}
                {/* Show message if there are more options than shown and not typing or input is empty */}
                {(!isTyping || inputValue === '') &&
                  options.length > defaultVisibleCount && (
                    <div className='px-3 py-2 text-xs text-muted-foreground text-center border-t bg-popover'>
                      Continue a digitar para ver mais opções...
                    </div>
                  )}
              </CommandGroup>
            )}
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
