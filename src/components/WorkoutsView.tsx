import { Download, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { WORKOUT_TEMPLATES } from '../data/seedData';
import type { WorkoutCategory, WorkoutSession, WorkoutTemplate } from '../types/fitness';
import {
  calculateWorkoutVolumeKg,
  exportWorkoutsCsv,
  formatFullDate,
  formatPaceMinPerKm,
  getCategoryLabel,
} from '../utils/storage';

interface WorkoutsViewProps {
  workouts: WorkoutSession[];
  onOpenNewWorkout: (template?: WorkoutTemplate) => void;
  onSelectSession: (session: WorkoutSession) => void;
}

type FilterCategory = 'all' | WorkoutCategory;
type SortKey = 'newest' | 'duration' | 'calories';

export function WorkoutsView({
  workouts,
  onOpenNewWorkout,
  onSelectSession,
}: WorkoutsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workouts
      .filter((w) => {
        if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
        if (!q) return true;
        const inTitle = w.title.toLowerCase().includes(q);
        const inNotes = (w.notes ?? '').toLowerCase().includes(q);
        const inExercises = (w.exercises ?? []).some((ex) =>
          ex.name.toLowerCase().includes(q)
        );
        return inTitle || inNotes || inExercises;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return b.durationMin - a.durationMin;
        if (sortBy === 'calories') return b.calories - a.calories;
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      });
  }, [workouts, search, categoryFilter, sortBy]);

  const summary = useMemo(() => {
    const totalMinutes = filtered.reduce((sum, w) => sum + w.durationMin, 0);
    const totalCalories = filtered.reduce((sum, w) => sum + w.calories, 0);
    const totalVolumeKg = filtered.reduce((sum, w) => sum + calculateWorkoutVolumeKg(w), 0);
    const prCount = filtered.filter((w) => w.isPr).length;
    return { totalMinutes, totalCalories, totalVolumeKg, prCount };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Training Log
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'session' : 'sessions'} ·{' '}
            {summary.totalMinutes.toLocaleString()} min · {summary.totalCalories.toLocaleString()} kcal ·{' '}
            {summary.totalVolumeKg.toLocaleString()} kg lifted · {summary.prCount} PRs
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportWorkoutsCsv(filtered)}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenNewWorkout()}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500 mb-3">Start from template</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKOUT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onOpenNewWorkout(tpl)}
              className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 truncate">{tpl.title}</p>
              <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                {getCategoryLabel(tpl.category)} · {tpl.durationMin} min · {tpl.calories} kcal
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'strength', label: 'Strength' },
              { id: 'running', label: 'Running' },
              { id: 'cycling', label: 'Cycling' },
              { id: 'hiit', label: 'HIIT' },
              { id: 'mobility', label: 'Mobility' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise, title, or notes..."
              className="w-full sm:w-64 h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label="Sort workouts"
            className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-orange-600 focus:outline-none"
          >
            <option value="newest">Sort: Most Recent</option>
            <option value="duration">Sort: Longest Duration</option>
            <option value="calories">Sort: Highest Burn</option>
          </select>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-900">No matching sessions found</p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your filter or log a new workout session.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-5">Session</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Output</th>
                  <th className="py-3 px-4 text-right">RPE</th>
                  <th className="py-3 px-5 text-right">Calories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((session) => {
                  const vol = calculateWorkoutVolumeKg(session);
                  return (
                    <tr
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{session.title}</span>
                          {session.isPr && (
                            <span className="text-xs font-mono font-semibold text-orange-600">
                              PR
                            </span>
                          )}
                        </div>
                        {session.notes && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">{session.notes}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {getCategoryLabel(session.category)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {formatFullDate(session.date)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                        {session.durationMin} min
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {session.distanceKm
                          ? `${session.distanceKm} km (${formatPaceMinPerKm(session.durationMin, session.distanceKm)})`
                          : vol > 0
                            ? `${vol.toLocaleString()} kg`
                            : session.avgHr
                              ? `${session.avgHr} bpm`
                              : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {session.rpe}/10
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                        {session.calories} kcal
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
