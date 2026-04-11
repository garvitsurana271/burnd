import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from 'recharts';
import type { DailySpendBucketView } from '../lib/snapshot.js';
import { formatUsd } from '../lib/format.js';

interface SpendChartProps {
  data: DailySpendBucketView[];
}

export function SpendChart({ data }: SpendChartProps): JSX.Element {
  const chartData = data.map((d) => ({
    ...d,
    // Recharts uses the day-of-month as the X-axis label for short display.
    label: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e1e2e" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#1e1e2e' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v === 0 ? '$0' : `$${v.toFixed(0)}`)}
            width={50}
          />
          <Tooltip content={<SpendTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="totalCostUsd"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpendTooltip({ active, payload }: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload as DailySpendBucketView | undefined;
  if (!data) return null;
  return (
    <div className="rounded-md border border-axis-border bg-axis-surfaceHigh px-3 py-2 font-mono text-xs shadow-xl">
      <div className="text-axis-textMuted">{data.date}</div>
      <div className="mt-1 text-base font-semibold text-axis-text">{formatUsd(data.totalCostUsd)}</div>
      <div className="mt-0.5 text-[10px] text-axis-textDim">
        {data.sessionCount} session{data.sessionCount === 1 ? '' : 's'}
      </div>
    </div>
  );
}
