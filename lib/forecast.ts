/**
 * Small, dependency-free trend projection for the admin dashboard.
 *
 * Deliberately simple: a least-squares line over a smoothed series. Site
 * traffic here is low-volume and noisy, so anything heavier (seasonality,
 * ARIMA) would be fitting noise and implying a precision the data can't back.
 */

export type SeriesPoint = { day: string; value: number };

export type Projection = {
  /** `horizon` future points, continuing the day sequence. */
  points: SeriesPoint[];
  /** Change per day from the fitted line. */
  slope: number;
  direction: 'up' | 'down' | 'flat';
  /** Percent change from the fit's start to the end of the horizon. */
  changePct: number;
};

/** Minimum real data points before a projection means anything. */
const MIN_POINTS = 4;

/** Window for the moving average that damps weekday-to-weekend swings. */
const SMOOTHING_WINDOW = 3;

/**
 * Trailing moving average. Keeps the series the same length by averaging over
 * however many points are available at the start.
 */
function smooth(values: number[], window = SMOOTHING_WINDOW): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
}

function addDays(isoDay: string, n: number): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Fit a line to the series and extend it `horizon` days past the last point.
 *
 * Returns null when there isn't enough data to fit — callers should render an
 * explicit "not enough data" state rather than a line the numbers don't support.
 */
export function projectTrend(series: SeriesPoint[], horizon = 7): Projection | null {
  if (!series || series.length < MIN_POINTS) return null;

  const values = smooth(series.map((p) => p.value));
  const n = values.length;

  // Least squares over x = 0..n-1.
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - meanX) * (values[i] - meanY);
    denominator += (i - meanX) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  const lastDay = series[series.length - 1].day;
  const points: SeriesPoint[] = [];
  for (let step = 1; step <= horizon; step++) {
    const x = n - 1 + step;
    points.push({
      day: addDays(lastDay, step),
      // Counts can't go negative, and a fitted line happily will.
      value: Math.max(0, Math.round(intercept + slope * x)),
    });
  }

  const fitStart = Math.max(0, intercept);
  const fitEnd = points[points.length - 1].value;
  const changePct = fitStart === 0 ? 0 : ((fitEnd - fitStart) / fitStart) * 100;

  // Treat a slope under ~1 event per 10 days as flat; below that the line is
  // indistinguishable from noise at this data volume.
  const direction: Projection['direction'] =
    Math.abs(slope) < 0.1 ? 'flat' : slope > 0 ? 'up' : 'down';

  return { points, slope, direction, changePct };
}

/** Percent change between two window totals, guarding division by zero. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export type Backtest = {
  /** Mean absolute percentage error of the held-out projection vs what actually happened. */
  mape: number;
  /** 0-100, `100 - mape` clamped -- a plain-language "accuracy" score for the UI. */
  accuracy: number;
  horizon: number;
};

/**
 * Retroactively checks the projection method: fit on everything except the
 * last `horizon` days, project forward, and compare against what those days
 * actually did. This is the only way to show "the projection is worth
 * trusting" instead of just asserting it -- a fitted line always looks
 * confident on its own training data.
 *
 * Returns null when there isn't enough history to hold out a full horizon
 * and still clear MIN_POINTS for the fit.
 */
export function backtestProjection(series: SeriesPoint[], horizon = 7): Backtest | null {
  if (!series || series.length < MIN_POINTS + horizon) return null;

  const training = series.slice(0, series.length - horizon);
  const actualHeldOut = series.slice(series.length - horizon);

  const projection = projectTrend(training, horizon);
  if (!projection) return null;

  // Skip days where actual was 0 -- percentage error is undefined/infinite
  // against a zero denominator, and low-traffic days shouldn't dominate the score.
  let errorSum = 0;
  let counted = 0;
  for (let i = 0; i < horizon; i++) {
    const actual = actualHeldOut[i]?.value ?? 0;
    const predicted = projection.points[i]?.value ?? 0;
    if (actual === 0) continue;
    errorSum += Math.abs(actual - predicted) / actual;
    counted++;
  }

  if (counted === 0) return null;

  const mape = (errorSum / counted) * 100;
  const accuracy = Math.max(0, 100 - mape);

  return { mape, accuracy, horizon };
}
