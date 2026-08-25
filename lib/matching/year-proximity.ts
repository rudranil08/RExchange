/**
 * Normalizes human-readable or string year values to numeric 1, 2, 3, 4.
 * Returns null if the year is missing or unknown.
 */
export function normalizeAcademicYear(yearValue?: string | number | null): number | null {
  if (yearValue === undefined || yearValue === null) return null;

  if (typeof yearValue === 'number') {
    if (yearValue >= 1 && yearValue <= 4) return yearValue;
    if (yearValue > 4) return 4;
    return null;
  }

  const str = String(yearValue).trim().toLowerCase();

  if (str === '1' || str === '1st' || str === 'first' || str === 'freshman') return 1;
  if (str === '2' || str === '2nd' || str === 'second' || str === 'sophomore') return 2;
  if (str === '3' || str === '3rd' || str === 'third' || str === 'junior') return 3;
  if (str === '4' || str === '4th' || str === 'fourth' || str === 'senior' || str === 'graduate' || str === 'grad') return 4;

  const parsed = parseInt(str, 10);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) return parsed;

  return null;
}

/**
 * Calculates year proximity between two students.
 * - yearGap = 0: strongest compatibility
 * - yearGap = 1: fully eligible
 * - yearGap = 2: eligible but lower contextual priority
 * - yearGap >= 3: excluded from default candidate generation
 *
 * If either year is unknown/missing, returns isEligible = true, yearGap = null (fallback without penalty).
 */
export function evaluateYearCompatibility(
  yearA?: string | number | null,
  yearB?: string | number | null
): { isEligible: boolean; yearGap: number | null } {
  const normA = normalizeAcademicYear(yearA);
  const normB = normalizeAcademicYear(yearB);

  // Missing/unknown fallback: do not exclude if year data is unavailable
  if (normA === null || normB === null) {
    return { isEligible: true, yearGap: null };
  }

  const yearGap = Math.abs(normA - normB);

  // Hard exclusion if gap is 3 or more (e.g. 1st year ↔ 4th year)
  if (yearGap >= 3) {
    return { isEligible: false, yearGap };
  }

  return { isEligible: true, yearGap };
}
