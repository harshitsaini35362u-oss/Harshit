import { useMemo, useState } from 'react';
import { shiftIsoDate } from '../data/seedData';
import type { DailyActivity, FitnessGoals, WorkoutSession } from '../types/fitness';

type ChartMetric = 'calories' | 'minutes' | 'steps';
type ChartRange = 7 | 14 | 30;

interface ActivityChartProps {
  anchorDate: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  workouts: WorkoutSession[];
  activities: Record<string, DailyActivity>;
  goals: FitnessGoals;
}

export function ActivityChart({
  anchorDate,
  selectedDate,
  onSelectDate,
  workouts,
  activities,
  goals,
}: ActivityChartProps) {
  const [metric, setMetric] = useState<ChartMetric>('calories');
  const [range, setRange] = useState<ChartRange>(7);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const series = useMemo(() => {
    const days: Array<{
      iso: string;
      shortLabel: string;
      fullLabel: string;
      calories: number;
      minutes: number;
      steps: number;
      sessions: number;
    }> = [];

    for (let i = -(range - 1); i <= 0; i++) {
      const iso = shiftIsoDate(anchorDate, i);
      const dayWorkouts = workouts.filter((w) => w.date === iso);
      const calories = dayWorkouts.reduce((acc, w) => acc + w.calories, 0);
      const minutes = dayWorkouts.reduce((acc, w) => acc + w.durationMin, 0);
      const steps = activities[iso]?.steps ?? 0;

      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const shortLabel =
        range === 7
          ? dt.toLocaleDateString('en-US', { weekday: 'short' })
          : `${m}/${d}`;
      const fullLabel = dt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      days.push({
        iso,
        shortLabel,
        fullLabel,
        calories,
        minutes,
        steps,
        sessions: dayWorkouts.length,
      });
    }
    return days;
  }, [anchorDate, range, workouts, activities]);

  const targetValue =
    metric === 'calories'
      ? goals.dailyCalorieBurn
      : metric === 'minutes'
        ? Math.round(goals.weeklyActiveMinutes / 7)
        : goals.dailySteps;

  const maxValue = useMemo(() => {
    const peak = Math.max(targetValue, ...series.map((d) => d[metric]), 10);
    return Math.ceil(peak * 1.15);
  }, [series, metric, targetValue]);

  const totalMetric = useMemo(
    () => series.reduce((sum, item) => sum + item[metric], 0),
    [series, metric]
  );

  const avgMetric = Math.round(totalMetric / Math.max(1, series.length));

  const inspected = hoveredIdx !== null ? series[hoveredIdx] : series.find((d) => d.iso === selectedDate) ?? series[series.length - 1];

  const chartWidth = 680;
  const chartHeight = 210;
  const padLeft = 44;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 28;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  const targetY = padTop + plotHeight - (targetValue / maxValue) * plotHeight;

  const formatUnit = (val: number) => {
    if (metric === 'calories') return `${val.toLocaleString()} kcal`;
    if (metric === 'minutes') return `${val.toLocaleString()} min`;
    return `${val.toLocaleString()} steps`;
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-950">
            Training Output &amp; Consistency
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
            {range}-day total: <span className="font-mono text-slate-800 font-medium">{formatUnit(totalMetric)}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            Daily avg: <span className="font-mono text-slate-800 font-medium">{formatUnit(avgMetric)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg" role="group" aria-label="Chart metric">
            {(
              [
                { id: 'calories', label: 'Calories' },
                { id: 'minutes', label: 'Minutes' },
                { id: 'steps', label: 'Steps' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMetric(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  metric === item.id
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-lg" role="group" aria-label="Date range">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  range === r
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{inspected.fullLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-orange-600">
            {formatUnit(inspected[metric])}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {inspected.sessions} {inspected.sessions === 1 ? 'session' : 'sessions'}
          </span>
        </div>
        <span className="font-mono tabular-nums text-slate-500">
          Target: {formatUnit(targetValue)}
        </span>
      </div>

      <div className="mt-3 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-52 select-none"
          role="img"
          aria-label={`${range}-day ${metric} bar chart`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padTop + plotHeight * (1 - tick);
            const val = Math.round(maxValue * tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          <line
            x1={padLeft}
            y1={targetY}
            x2={chartWidth - padRight}
            y2={targetY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {series.map((day, idx) => {
            const slotWidth = plotWidth / series.length;
            const barWidth = Math.max(6, Math.min(34, slotWidth * 0.58));
            const x = padLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
            const value = day[metric];
            const barHeight = Math.max(value > 0 ? 4 : 2, (value / maxValue) * plotHeight);
            const y = padTop + plotHeight - barHeight;

            const isSelected = day.iso === selectedDate;
            const isHovered = hoveredIdx === idx;
            const metGoal = value >= targetValue;

            const fill =
              value === 0
                ? '#e2e8f0'
                : isSelected || isHovered
                  ? '#ea580c'
                  : metGoal
                    ? '#0f172a'
                    : '#fb923c';

            const showLabel =
              range === 7 || idx === 0 || idx === series.length - 1 || idx % (range === 14 ? 2 : 5) === 0;

            return (
              <g
                key={day.iso}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectDate(day.iso)}
              >
                <rect
                  x={padLeft + idx * slotWidth}
                  y={padTop}
                  width={slotWidth}
                  height={plotHeight + padBottom}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(4, barWidth / 3)}
                  fill={fill}
                  className="transition-colors duration-150"
                />
                {showLabel && (
                  <text
                    x={padLeft + idx * slotWidth + slotWidth / 2}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${
                      isSelected ? 'fill-orange-600 font-semibold' : 'fill-slate-500'
                    }`}
                  >
                    {day.shortLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
