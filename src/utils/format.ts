const ONE_MINUTE_IN_MS = 1000 * 60
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60
const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24

export const LIST_FORMAT = new Intl.ListFormat('de-DE', {})

export const DATE_FORMAT = new Intl.DateTimeFormat('de-DE')

export function formatRelativeDate(date: Date) {
  const deltaTime = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('de-DE')

  if (Math.abs(deltaTime) > ONE_DAY_IN_MS) {
    const inDays = Math.round(deltaTime / ONE_DAY_IN_MS)
    return rtf.format(inDays, 'days')
  }

  if (Math.abs(deltaTime) > ONE_HOUR_IN_MS) {
    const inHours = Math.round(deltaTime / ONE_HOUR_IN_MS)
    return rtf.format(inHours, 'hours')
  }

  const inMinutes = Math.round(deltaTime / ONE_MINUTE_IN_MS)
  if (inMinutes === 0) return 'now'

  return rtf.format(inMinutes, 'minutes')
}

export function formatAbsoluteTime(time: number) {
  let remainingTime = time

  const hours = Math.floor(remainingTime / ONE_HOUR_IN_MS)
  remainingTime -= hours * ONE_HOUR_IN_MS

  const minutes = Math.floor(remainingTime / ONE_MINUTE_IN_MS)
  remainingTime -= minutes * ONE_MINUTE_IN_MS

  const formattedHours = `${String(hours).padStart(2, '0')} std `
  const formattedMinutes = `${String(minutes).padStart(2, '0')} min`

  return hours > 0 ? formattedHours + formattedMinutes : formattedMinutes
}
