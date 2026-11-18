import { Check, Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toIsoDate } from '../data/seedData';
import type { BodyMetricEntry, FitnessGoals, FitnessState } from '../types/fitness';
import { exportFullJson, formatFullDate, makeId } from '../utils/storage';

interface BodyMetricsViewProps {
  state: FitnessState;
  onAddMetric: (entry: BodyMetricEntry) => void;
  onDeleteMetric: (id: string) => void;
  onUpdateGoals: (goals: FitnessGoals) => void;
  onResetAll: () => void;
}

export function BodyMetricsView({
  state,
  onAddMetric,
  onDeleteMetric,
  onUpdateGoals,
  onResetAll,
}: BodyMetricsViewProps) {
  const todayIso = toIsoDate(new Date());
  const sortedMetrics = useMemo(
    () => [...state.bodyMetrics].sort((a, b) => a.date.localeCompare(b.date)),
    [state.bodyMetrics]
  );
  const latest = sortedMetrics[sortedMetrics.length - 1];

  const [date, setDate] = useState(todayIso);
  const [weightKg, setWeightKg] = useState(latest ? String(latest.weightKg) : '65.0');
  const [bodyFatPct, setBodyFatPct] = useState(
    latest?.bodyFatPct ? String(latest.bodyFatPct) : ''
  );
  const [restingHr, setRestingHr] = useState(
    latest?.restingHr ? String(latest.restingHr) : ''
  );

  const [goalDraft, setGoalDraft] = useState<FitnessGoals>(state.goals);
  const [goalsSavedNotice, setGoalsSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleLogMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(weightKg);
    if (!w || w <= 0) return;
    onAddMetric({
      id: makeId('bm'),
      date,
      weightKg: Number(w.toFixed(1)),
      bodyFatPct: bodyFatPct ? Number(Number(bodyFatPct).toFixed(1)) : undefined,
      restingHr: restingHr ? Math.round(Number(restingHr)) : undefined,
    });
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(goalDraft);
    setGoalsSavedNotice(true);
    window.setTimeout(() => setGoalsSavedNotice(false), 2500);
  };

  const chartPoints = useMemo(() => {
    if (sortedMetrics.length === 0) return [];
    const weights = sortedMetrics.map((m) => m.weightKg);
    const minW = Math.min(...weights, state.goals.targetWeightKg) - 0.8;
    const maxW = Math.max(...weights, state.goals.targetWeightKg) + 0.8;
    const span = Math.max(1, maxW - minW);

    const width = 620;
    const height = 180;
    const padX = 44;
    const padY = 20;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    return sortedMetrics.map((m, i) => {
      const x =
        sortedMetrics.length === 1
          ? padX + plotW / 2
          : padX + (i / (sortedMetrics.length - 1)) * plotW;
      const y = padY + plotH - ((m.weightKg - minW) / span) * plotH;
      return { ...m, x, y, minW, maxW, span, padY, plotH, padX, plotW, width, height };
    });
  }, [sortedMetrics, state.goals.targetWeightKg]);

  const polylineStr = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const targetLineY =
    chartPoints.length > 0
      ? chartPoints[0].padY +
        chartPoints[0].plotH -
        ((state.goals.targetWeightKg - chartPoints[0].minW) / chartPoints[0].span) *
          chartPoints[0].plotH
      : 90;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Body Metrics &amp; Targets
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            Current weight: {latest ? `${latest.weightKg} kg` : '—'} · Target:{' '}
            {state.goals.targetWeightKg} kg
            {latest?.restingHr ? ` · Resting HR ${latest.restingHr} bpm` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportFullJson(state)}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Backup (JSON)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-950">
                Weight Progression
              </h2>
              <p className="text-xs text-slate-500">
                Dashed line indicates target weight ({state.goals.targetWeightKg} kg)
              </p>
            </div>
            {sortedMetrics.length >= 2 && (
              <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
                Δ {(sortedMetrics[sortedMetrics.length - 1].weightKg - sortedMetrics[0].weightKg).toFixed(1)} kg
              </span>
            )}
          </div>

          {chartPoints.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Log your first body measurement to plot your trend.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden">
              <svg viewBox="0 0 620 180" className="w-full h-48 select-none" role="img" aria-label="Weight progression line chart">
                <line
                  x1={chartPoints[0].padX}
                  y1={targetLineY}
                  x2={chartPoints[0].width - chartPoints[0].padX}
                  y2={targetLineY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartPoints[0].width - chartPoints[0].padX}
                  y={targetLineY - 5}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  Target {state.goals.targetWeightKg} kg
                </text>

                {chartPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylineStr}
                  />
                )}

                {chartPoints.map((pt) => (
                  <g key={pt.id}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className="fill-slate-900 text-[10px] font-mono font-semibold tabular-nums"
                    >
                      {pt.weightKg}
                    </text>
                    <text
                      x={pt.x}
                      y={170}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-mono tabular-nums"
                    >
                      {pt.date.slice(5)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 divide-y divide-slate-100">
            {[...sortedMetrics].reverse().map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <span className="font-mono text-slate-600 tabular-nums">{formatFullDate(m.date)}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-slate-950 tabular-nums">
                    {m.weightKg} kg
                  </span>
                  {m.bodyFatPct !== undefined && (
                    <span className="font-mono text-slate-600 tabular-nums">
                      {m.bodyFatPct}% BF
                    </span>
                  )}
                  {m.restingHr !== undefined && (
                    <span className="font-mono text-slate-600 tabular-nums">
                      {m.restingHr} bpm
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteMetric(m.id)}
                    aria-label={`Delete entry from ${m.date}`}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-display text-base font-semibold text-slate-950 mb-3">
              Log Measurement
            </h2>
            <form onSubmit={handleLogMetric} className="space-y-3">
              <div>
                <label htmlFor="bm-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  id="bm-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono focus:border-orange-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="bm-weight" className="block text-xs font-medium text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    id="bm-weight"
                    type="number"
                    step="0.1"
                    min={20}
                    max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="bm-bf" className="block text-xs font-medium text-slate-700 mb-1">
                    Body fat %
                  </label>
                  <input
                    id="bm-bf"
                    type="number"
                    step="0.1"
                    min={3}
                    max={60}
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    placeholder="Opt."
                    className="w-full h-10 px-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="bm-hr" className="block text-xs font-medium text-slate-700 mb-1">
                    Rest HR
                  </label>
                  <input
                    id="bm-hr"
                    type="number"
                    min={30}
                    max={140}
                    value={restingHr}
                    onChange={(e) => setRestingHr(e.target.value)}
                    placeholder="bpm"
                    className="w-full h-10 px-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Entry</span>
              </button>
            </form>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-display text-base font-semibold text-slate-950 mb-3">
              Daily &amp; Weekly Targets
            </h2>
            <form onSubmit={handleSaveGoals} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="g-burn" className="block text-xs font-medium text-slate-700 mb-1">
                    Active burn (kcal)
                  </label>
                  <input
                    id="g-burn"
                    type="number"
                    value={goalDraft.dailyCalorieBurn}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, dailyCalorieBurn: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-steps" className="block text-xs font-medium text-slate-700 mb-1">
                    Daily steps
                  </label>
                  <input
                    id="g-steps"
                    type="number"
                    step="500"
                    value={goalDraft.dailySteps}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, dailySteps: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-water" className="block text-xs font-medium text-slate-700 mb-1">
                    Water (ml)
                  </label>
                  <input
                    id="g-water"
                    type="number"
                    step="250"
                    value={goalDraft.dailyWaterMl}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, dailyWaterMl: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-wmin" className="block text-xs font-medium text-slate-700 mb-1">
                    Weekly active (min)
                  </label>
                  <input
                    id="g-wmin"
                    type="number"
                    value={goalDraft.weeklyActiveMinutes}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, weeklyActiveMinutes: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-intake" className="block text-xs font-medium text-slate-700 mb-1">
                    Intake (kcal)
                  </label>
                  <input
                    id="g-intake"
                    type="number"
                    value={goalDraft.dailyCalorieIntake}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, dailyCalorieIntake: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-protein" className="block text-xs font-medium text-slate-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    id="g-protein"
                    type="number"
                    value={goalDraft.dailyProteinG}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, dailyProteinG: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="g-weight" className="block text-xs font-medium text-slate-700 mb-1">
                    Target weight (kg)
                  </label>
                  <input
                    id="g-weight"
                    type="number"
                    step="0.1"
                    value={goalDraft.targetWeightKg}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, targetWeightKg: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold transition-colors"
              >
                {goalsSavedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Targets Updated</span>
                  </>
                ) : (
                  <span>Update Targets</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100">
              {confirmReset ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-red-700 font-medium">Restore sample data?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2.5 py-1 rounded border border-slate-200 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetAll();
                        setConfirmReset(false);
                      }}
                      className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to sample baseline</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
