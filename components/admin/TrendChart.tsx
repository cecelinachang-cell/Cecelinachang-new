'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { projectTrend, backtestProjection, type SeriesPoint } from '@/lib/forecast';

type TrendChartProps = {
  title: string;
  subtitle?: string;
  series: SeriesPoint[];
  color: string;
  /** Days of projection to draw past the last real point. */
  horizon?: number;
  loading?: boolean;
  error?: string | null;
  /** Appended after formatted numbers, e.g. '%' for a rate series. */
  unit?: string;
  /** Round to this many decimals instead of the default integer display. */
  decimals?: number;
  /** 'sum' for counts (default), 'avg' for rates like conversion % where totaling days is meaningless. */
  aggregate?: 'sum' | 'avg';
};

function formatValue(value: number, unit?: string, decimals = 0): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${unit ?? ''}`;
}

const formatDay = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

export default function TrendChart({
  title,
  subtitle,
  series,
  color,
  horizon = 7,
  loading = false,
  error = null,
  unit,
  decimals = 0,
  aggregate = 'sum',
}: TrendChartProps) {
  const projection = useMemo(() => projectTrend(series, horizon), [series, horizon]);
  const backtest = useMemo(() => backtestProjection(series, horizon), [series, horizon]);

  /**
   * Recharts draws a gap wherever a value is null, so actual and projected are
   * separate keys. The last real point is duplicated into `projected` so the
   * dashed line connects to the solid one instead of floating.
   */
  const data = useMemo(() => {
    const actual = series.map((p, i) => ({
      day: p.day,
      actual: p.value,
      projected: i === series.length - 1 ? p.value : null,
    }));

    if (!projection) return actual;

    return [
      ...actual,
      ...projection.points.map((p) => ({ day: p.day, actual: null, projected: p.value })),
    ];
  }, [series, projection]);

  const sum = series.reduce((s, p) => s + p.value, 0);
  const total = aggregate === 'avg' ? (series.length ? sum / series.length : 0) : sum;

  const trendIcon =
    projection?.direction === 'up' ? (
      <TrendingUp className="w-4 h-4" />
    ) : projection?.direction === 'down' ? (
      <TrendingDown className="w-4 h-4" />
    ) : (
      <Minus className="w-4 h-4" />
    );

  const trendColor =
    projection?.direction === 'up'
      ? 'text-green-600 bg-green-50'
      : projection?.direction === 'down'
        ? 'text-red-600 bg-red-50'
        : 'text-stone-500 bg-stone-100';

  const projectedSum = projection ? projection.points.reduce((s, p) => s + p.value, 0) : 0;
  const projectedTotal =
    aggregate === 'avg' && projection ? projectedSum / projection.points.length : projectedSum;

  const gradientId = `grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 pb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-900">{title}</h3>
          <p className="text-sm text-stone-500 mt-1">
            {subtitle ?? `${formatValue(total, unit, decimals)} in selected range`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {projection && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${trendColor}`}
              title={`Fitted trend: ${projection.slope >= 0 ? '+' : ''}${projection.slope.toFixed(2)} per day`}
            >
              {trendIcon}
              <span>
                {projection.direction === 'flat'
                  ? 'Holding steady'
                  : `${projection.direction === 'up' ? 'Trending up' : 'Trending down'}`}
              </span>
            </div>
          )}
          {backtest && (
            <span
              className="text-[11px] text-stone-400"
              title={`Held out the last ${backtest.horizon} days, fit on what remained, and compared the projection to what actually happened. Mean absolute error: ${backtest.mape.toFixed(0)}%.`}
            >
              Projection accuracy: {backtest.accuracy.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      <div className="px-2 pb-4">
        {error ? (
          <div className="h-56 flex items-center justify-center text-sm text-red-600 px-6 text-center">
            {error}
          </div>
        ) : loading ? (
          <div className="h-56 flex items-center justify-center text-sm text-stone-400">
            Loading…
          </div>
        ) : series.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-stone-500">
            No data recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={formatDay}
                tick={{ fontSize: 11, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                width={36}
                allowDecimals={decimals > 0}
                tickFormatter={(v) => formatValue(Number(v), unit, decimals)}
              />
              <Tooltip
                labelFormatter={(day) => formatDay(String(day))}
                formatter={(value, name) => [
                  formatValue(value == null ? 0 : Number(value), unit, decimals),
                  name === 'projected' ? 'Projected' : 'Actual',
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e7e5e4',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="none"
                fill={`url(#${gradientId})`}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke={color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="5 4"
                strokeOpacity={0.65}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 text-xs text-stone-500">
        {projection ? (
          <>
            Projected {aggregate === 'avg' ? 'average over' : 'total over'} next {horizon} days:{' '}
            <span className="font-semibold text-stone-700">
              ~{formatValue(projectedTotal, unit, decimals)}
            </span>{' '}
            <span className="text-stone-400">
              · linear trend on a {3}-day average, not a guarantee
            </span>
          </>
        ) : (
          <>Not enough data to project yet — needs at least 4 days.</>
        )}
      </div>
    </div>
  );
}
