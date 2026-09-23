// Sanitizers for the optional landing-page fields on /api/leads. Kept pure so
// they can be unit tested without a request or a database.

export function sanitizeQuizAnswers(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const answers = value
    .filter((a): a is string => typeof a === 'string' && a.trim() !== '')
    .slice(0, 10)
    .map((a) => a.slice(0, 200));
  return answers.length ? answers : null;
}

/** Age ranges offered on the landing-page form; tapping one beats typing on a phone. */
export const AGE_RANGES = ['Di bawah 25', '25–34', '35–44', '45–54', '55+'] as const;

export function sanitizeAgeRange(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const range = value.trim();
  return (AGE_RANGES as readonly string[]).includes(range) ? range : null;
}

export function sanitizeSource(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return value.trim().slice(0, 120);
}

/**
 * True when an insert failed only because a column doesn't exist yet, i.e.
 * supabase/migrations/20260922_lead_quiz_answers.sql hasn't been applied.
 * PGRST204 is PostgREST's "column not in schema cache"; 42703 is Postgres'
 * undefined_column. Anything else (RLS, constraints) is a real failure.
 */
export function isMissingColumnError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === 'PGRST204' || error.code === '42703';
}
