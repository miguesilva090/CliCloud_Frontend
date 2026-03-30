import { createContext, useContext, useEffect, useState } from 'react'
import { AppLoader } from '@/components/shared/app-loader'

type Theme =
  | 'dark'
  | 'light'
  | 'blue'
  | 'teal'
  | 'monokai-pro'
  | 'mean-blue-cue'
  | 'bold-tech-dark'
  | 'bold-tech-light'
  | 'ocean-breeze-dark'
  | 'sunset-horizon-light'
  | 'sunset-horizon-dark'
  | 'kodama-grove-light'
  | 'kodama-grove-dark'
  | 'claymorphism-light'
  | 'claymorphism-dark'
  | 'pastel-dreams-light'
  | 'pastel-dreams-dark'
  | 'medical-light'
  | 'medical-dark'
  | 'tropical-sunset-light'
  | 'mint-fresh-light'
  | 'forest-garden-light'
  | 'arctic-ice-light'
  | 'cherry-blossom-light'
  | 'midnight-ocean-light'
  | 'cosmic-galaxy-light'
  | 'starlight-aurora-dark'
  | 'midnight-sapphire-dark'
  | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultIconTheme?: IconTheme
  storageKey?: string
  iconStorageKey?: string
}

type IconTheme = 'colorful' | 'theme-color' | 'pastel' | 'vibrant' | 'neon'

type ThemeProviderState = {
  theme: Theme
  iconTheme: IconTheme
  isChangingTheme: boolean
  setTheme: (theme: Theme) => void
  setIconTheme: (iconTheme: IconTheme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  iconTheme: 'colorful',
  isChangingTheme: false,
  setTheme: () => null,
  setIconTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultIconTheme = 'colorful',
  storageKey = 'vite-ui-theme',
  iconStorageKey = 'vite-ui-icon-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [iconTheme, setIconTheme] = useState<IconTheme>(
    () =>
      (localStorage.getItem(iconStorageKey) as IconTheme) || defaultIconTheme
  )
  const [isChangingTheme, setIsChangingTheme] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove(
      'light',
      'dark',
      'blue',
      'teal',
      'monokai-pro',
      'mean-blue-cue',
      'bold-tech-dark',
      'bold-tech-light',
      'ocean-breeze-dark',
      'sunset-horizon-light',
      'sunset-horizon-dark',
      'kodama-grove-light',
      'kodama-grove-dark',
      'claymorphism-light',
      'claymorphism-dark',
      'pastel-dreams-light',
      'pastel-dreams-dark',
      'medical-light',
      'medical-dark',
      'tropical-sunset-light',
      'mint-fresh-light',
      'forest-garden-light',
      'arctic-ice-light',
      'cherry-blossom-light',
      'midnight-ocean-light',
      'cosmic-galaxy-light',
      'starlight-aurora-dark',
      'midnight-sapphire-dark'
    )

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
    root.classList.add(`icon-${iconTheme}`)
  }, [theme, iconTheme])

  // Handle theme change loading state
  useEffect(() => {
    if (isChangingTheme) {
      // Hide loader after theme has been applied
      const timer = setTimeout(() => {
        setIsChangingTheme(false)
      }, 150) // Further reduced delay for faster transition

      return () => clearTimeout(timer)
    }
  }, [isChangingTheme])

  const value = {
    theme,
    iconTheme,
    isChangingTheme,
    setTheme: (newTheme: Theme) => {
      setIsChangingTheme(true)
      localStorage.setItem(storageKey, newTheme)
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setTheme(newTheme)
      })
    },
    setIconTheme: (newIconTheme: IconTheme) => {
      setIsChangingTheme(true)
      localStorage.setItem(iconStorageKey, newIconTheme)
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setIconTheme(newIconTheme)
      })
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
      <AppLoader
        isLoading={isChangingTheme}
        title='Aplicando tema...'
        description='Por favor aguarde'
        icon='settings'
      />
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
