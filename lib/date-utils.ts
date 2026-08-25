const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Deterministically formats a date string/number/Date object into human-readable "24 Aug 2026".
 * Guaranteed to produce the exact same output on SSR and Client across all operating systems,
 * browser locales, and timezones.
 */
export function formatDeterministicDate(
  dateInput?: string | number | Date | null
): string {
  if (!dateInput) return '';

  const d =
    typeof dateInput === 'object' && dateInput instanceof Date
      ? dateInput
      : new Date(dateInput);

  if (isNaN(d.getTime())) return '';

  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  return `${day} ${month} ${year}`;
}
