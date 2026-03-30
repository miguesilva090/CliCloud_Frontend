import { useMemo, memo, useCallback } from 'react'
import { useTheme } from '@/providers/theme-provider'
import { Moon, Sun, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { IconThemeToggle } from './icon-theme-toggle'

// Memoized dark themes set for better performance
const DARK_THEMES = new Set([
  'blue',
  'bold-tech-dark',
  'claymorphism-dark',
  'starlight-aurora-dark',
  'dark',
  'kodama-grove-dark',
  'medical-dark',
  'midnight-forest-dark',
  'monokai-pro',
  'ocean-breeze-dark',
  'sunset-horizon-dark',
  'teal',
])

// Memoized theme item component
const ThemeItem = memo(
  ({
    themeName,
    label,
    currentTheme,
    onSelect,
  }: {
    themeName: string
    label: string
    currentTheme: string
    onSelect: (theme: string) => void
  }) => {
    const isSelected = currentTheme === themeName
    const handleClick = useCallback(
      () => onSelect(themeName),
      [themeName, onSelect]
    )

    return (
      <DropdownMenuItem
        onClick={handleClick}
        className={isSelected ? 'bg-accent text-accent-foreground' : ''}
      >
        {label}
      </DropdownMenuItem>
    )
  }
)

ThemeItem.displayName = 'ThemeItem'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  // Memoize dark theme calculation
  const isDarkTheme = useMemo(() => DARK_THEMES.has(theme), [theme])

  // Memoize theme change handler
  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme as any)
    },
    [setTheme]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          {isDarkTheme ? (
            <Moon className='h-[1.2rem] w-[1.2rem]' />
          ) : (
            <Sun className='h-[1.2rem] w-[1.2rem]' />
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        {/* Two Column Layout */}
        <div className='grid grid-cols-2 gap-4 p-2'>
          {/* Light Themes Column */}
          <div className='space-y-1'>
            <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
              Temas Claros
            </div>
            <ThemeItem
              themeName='light'
              label='Claro'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='arctic-ice-light'
              label='Arctic Ice'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='bold-tech-light'
              label='Bold Tech'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='cherry-blossom-light'
              label='Cherry Blossom'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='cosmic-galaxy-light'
              label='Cosmic Galaxy'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='medical-light'
              label='Medical Light'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='mint-fresh-light'
              label='Mint Fresh'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='midnight-ocean-light'
              label='Midnight Ocean'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='pastel-dreams-light'
              label='Pastel Dreams'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='tropical-sunset-light'
              label='Tropical Sunset'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
          </div>

          {/* Dark Themes Column */}
          <div className='space-y-1'>
            <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
              Temas Escuros
            </div>
            <ThemeItem
              themeName='dark'
              label='Escuro'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='blue'
              label='Blue'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='bold-tech-dark'
              label='Bold Tech'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='claymorphism-dark'
              label='Claymorphism'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='kodama-grove-dark'
              label='Kodama Grove'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='medical-dark'
              label='Medical Dark'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='monokai-pro'
              label='Monokai Pro'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='ocean-breeze-dark'
              label='Ocean Breeze'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
            <ThemeItem
              themeName='starlight-aurora-dark'
              label='Starlight Aurora'
              currentTheme={theme}
              onSelect={handleThemeChange}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />

        {/* Sistema */}
        <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
          Sistema
        </div>
        <ThemeItem
          themeName='system'
          label='Seguir Sistema'
          currentTheme={theme}
          onSelect={handleThemeChange}
        />
        <DropdownMenuSeparator />
        <div className='px-2 py-1.5'>
          <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2'>
            <Palette className='h-4 w-4' />
            Ícones
          </div>
          <IconThemeToggle />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
