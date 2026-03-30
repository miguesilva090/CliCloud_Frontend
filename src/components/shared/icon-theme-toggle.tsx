import { useTheme } from '@/providers/theme-provider'

type IconTheme = 'colorful' | 'theme-color' | 'pastel' | 'vibrant' | 'neon'

export function IconThemeToggle() {
  const { iconTheme, setIconTheme } = useTheme()

  const isSelected = (value: IconTheme) => iconTheme === value

  const themes = [
    {
      id: 'theme-color',
      label: 'Cor do Tema',
      color: 'hsl(var(--primary))',
      type: 'single' as const,
    },
    {
      id: 'colorful',
      label: 'Colorido',
      colors: ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'],
      type: 'grid' as const,
    },
    {
      id: 'pastel',
      label: 'Pastel',
      colors: ['bg-pink-300', 'bg-purple-300', 'bg-blue-300', 'bg-green-300'],
      type: 'grid' as const,
    },
    {
      id: 'vibrant',
      label: 'Vibrante',
      colors: ['bg-red-600', 'bg-orange-600', 'bg-yellow-600', 'bg-green-600'],
      type: 'grid' as const,
    },
    {
      id: 'neon',
      label: 'Neon',
      colors: ['bg-cyan-400', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400'],
      type: 'grid' as const,
    },
  ]

  return (
    <div className='flex items-center gap-3'>
      {themes.map((theme) => (
        <button
          key={theme.id}
          type='button'
          aria-label={theme.label}
          className={`h-6 w-6 rounded-md border transition-shadow ${
            isSelected(theme.id as IconTheme)
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              : ''
          } ${theme.type === 'grid' ? 'grid grid-cols-2 gap-px p-px' : ''}`}
          style={
            theme.type === 'single' ? { backgroundColor: theme.color } : {}
          }
          onClick={() => setIconTheme(theme.id as IconTheme)}
        >
          {theme.type === 'grid'
            ? theme.colors?.map((color, index) => (
                <span
                  key={index}
                  className={`block h-full w-full ${color} rounded-sm`}
                />
              ))
            : null}
        </button>
      ))}
    </div>
  )
}
