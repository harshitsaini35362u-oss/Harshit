interface KpiRingProps {
  label: string;
  valueText: string;
  targetText: string;
  percent: number;
  statusText: string;
  accentColor?: 'orange' | 'emerald' | 'slate';
  actionSlot?: React.ReactNode;
}

export function KpiRing({
  label,
  valueText,
  targetText,
  percent,
  statusText,
  accentColor = 'orange',
  actionSlot,
}: KpiRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeClass =
    accentColor === 'emerald'
      ? 'stroke-emerald-600'
      : accentColor === 'slate'
        ? 'stroke-slate-900'
        : 'stroke-orange-600';

  const statusClass =
    clamped >= 100
      ? 'text-emerald-700'
      : clamped >= 65
        ? 'text-slate-700'
        : 'text-slate-500';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
            {valueText}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">{targetText}</p>
        </div>

        <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
          <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52" aria-hidden="true">
            <circle
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              strokeWidth="4.5"
              className="stroke-slate-100"
            />
            <circle
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${strokeClass} transition-all duration-300`}
            />
          </svg>
          <span className="absolute text-[11px] font-mono font-semibold text-slate-800 tabular-nums">
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <span className={`text-xs font-medium ${statusClass}`}>{statusText}</span>
        {actionSlot ? <div className="flex items-center gap-1.5 shrink-0">{actionSlot}</div> : null}
      </div>
    </div>
  );
}
