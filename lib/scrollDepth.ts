/** Scroll milestones reported once per page view (percent of the page). */
export const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

/**
 * Milestones newly passed. `seenTo` is the highest milestone already sent.
 * The bottom counts as 100 once the viewport's bottom edge is within 2% of
 * the page end (mobile toolbars change the height by a few pixels).
 */
export function newMilestones(scrollBottom: number, pageHeight: number, seenTo: number): number[] {
  if (pageHeight <= 0) return [];
  const pct = scrollBottom >= pageHeight * 0.98 ? 100 : (scrollBottom / pageHeight) * 100;
  return SCROLL_MILESTONES.filter((m) => m > seenTo && pct >= m);
}
