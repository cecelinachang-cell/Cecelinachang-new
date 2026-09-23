export const NEXT_SCHEDULE_LABEL = "Jadwal kelas berikutnya: tanya Cece di WhatsApp";

/**
 * The date to show for the offline class, or a "ask for the next date" line
 * once it has started. Evaluated on the client when the quiz result shows, so
 * a cached page never advertises a class that has already happened.
 */
export function offlineScheduleLabel(
  schedule: { label: string; startsAt: string } | undefined,
  now: Date,
): string {
  if (!schedule) return NEXT_SCHEDULE_LABEL;
  return now.getTime() < new Date(schedule.startsAt).getTime() ? schedule.label : NEXT_SCHEDULE_LABEL;
}
