import * as flags from 'country-flag-icons/react/3x2'

interface LazyFlagProps {
  code?: string
  height?: number
  width?: number
  fallback?: React.ReactNode
}

export const LazyFlag = ({
  code,
  height = 24,
  width = 32,
  fallback = <span>🏳️</span>,
}: LazyFlagProps) => {
  // If code is undefined, just show the fallback
  if (!code) {
    return <>{fallback}</>
  }

  // Convert country code to uppercase (ISO 3166-1 alpha-2)
  const countryCode = code.toUpperCase()

  // Get the flag component for this country
  const FlagComponent = flags[countryCode as keyof typeof flags]

  // If flag not found, show fallback
  if (!FlagComponent) {
    return <>{fallback}</>
  }

  return (
    <FlagComponent
      style={{
        height: `${height}px`,
        width: `${width}px`,
        display: 'inline-block',
      }}
    />
  )
}
