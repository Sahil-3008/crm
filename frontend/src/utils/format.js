/**
 * utils/format.js
 * Date formatting helpers.
 */

/**
 * Full date + time, e.g. "May 28, 2026, 14:32"
 */
export function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

/**
 * Short date only, e.g. "May 28, 2026"
 */
export function formatDateShort(isoString) {
  if (!isoString) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}