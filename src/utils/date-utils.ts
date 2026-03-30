/**
 * Converts a Date object or date string to a Date object with timezone-safe handling
 * This avoids timezone conversion issues when storing dates
 * Returns undefined if the input is null, undefined, or invalid
 *
 * @param date - The Date object or date string to convert
 * @returns A Date object representing the local date, or undefined if invalid
 */
export const toDatabaseDate = (
  date: Date | string | null | undefined
): Date | undefined => {
  if (!date) return undefined
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return undefined
  // Create a new date with just the date part (no time) to avoid timezone issues
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const day = dateObj.getDate()
  // Create date at midnight UTC to avoid timezone conversion issues
  return new Date(Date.UTC(year, month, day))
}

/**
 * Converts a Date object or date string to a database-friendly date string in YYYY-MM-DD format
 * This avoids timezone conversion issues when storing dates as strings
 * Returns undefined if the input is null, undefined, or invalid
 *
 * @param date - The Date object or date string to convert
 * @returns A string in YYYY-MM-DD format (e.g., "2024-03-02"), or undefined if invalid
 */
export const toDatabaseDateString = (
  date: Date | string | null | undefined
): string | undefined => {
  if (!date) return undefined
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return undefined
  return dateObj.toLocaleDateString('en-CA')
}

/**
 * Converts various date formats from the database to a Date object
 * Handles timezone issues when loading dates from the API
 * Supports string, Date object, timestamp, and ISO string inputs
 *
 * @param date - The date from the database/API (string, Date, timestamp, or ISO string)
 * @returns A Date object representing the local date
 */
export const fromDatabaseDate = (
  date: string | Date | number | null | undefined
): Date | undefined => {
  if (!date) return undefined

  // Handle different input types
  if (typeof date === 'string') {
    return new Date(date)
  }

  if (typeof date === 'number') {
    return new Date(date)
  }

  if (date instanceof Date) {
    return new Date(date)
  }

  return undefined
}

/**
 * Formats a date for display in the UI
 *
 * @param date - The Date object or date string to format
 * @param locale - The locale to use for formatting (defaults to 'pt-PT')
 * @returns A formatted date string for display
 */
export const formatDateForDisplay = (
  date: Date | string,
  locale: string = 'pt-PT'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale)
}

/**
 * Formats a date and time for display in the UI
 *
 * @param date - The Date object or date string to format
 * @param locale - The locale to use for formatting (defaults to 'pt-PT')
 * @returns A formatted date and time string for display (e.g., "15/01/2024, 14:30")
 */
export const formatDateTimeForDisplay = (
  date: Date | string,
  locale: string = 'pt-PT'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
