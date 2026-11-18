import { ChevronRight, Plus } from 'lucide-react';
import { toIsoDate } from '../data/seedData';
import type { DailyActivity, FitnessState, WorkoutSession } from '../types/fitness';
import {
  calculateWorkoutVolumeKg,
  formatShortDate,
  getCategoryLabel,
  getWeekDates,
} from '../utils/storage';
import { ActivityChart } from './ActivityChart';
import { KpiRing } from './KpiRing';
import { LiveTimerCard } from './LiveTimerCard';

interface OverviewViewProps {
  state: FitnessState;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  onUpdateActivity: (iso: string, patch: Partial<DailyActivity>) => void;
  onOpenNewWorkout: (prefill?: { durationMin: number; calories: number }) => void;
  onSelectSession: (session: WorkoutSession) => void;
  onNavigateWorkouts: () => void;
}

export function OverviewView({
  state,
  selectedDate,
  onSelectDate,
  onUpdateActivity,
  onOpenNewWorkout,
  onSelectSession,
  onNavigateWorkouts,
}: OverviewViewProps) {
  const todayIso = toIsoDate(new Date());
  const weekDays = getWeekDates(todayIso);

  const dayWorkouts = state.workouts.filter((w) => w.date === selectedDate);
  const dayMeals = state.meals.filter((m) => m.date === selectedDate);
  const dayActivity = state.activities[selectedDate] ?? {
    date: selectedDate,
    steps: 0,
    waterMl: 0,
    sleepHrs: 7.5,
  };

  const caloriesBurned = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const activeMinutes = dayWorkouts.reduce((sum, w) => sum + w.durationMin, 0);
  const dailyMinTarget = Math.round(state.goals.weeklyActiveMinutes / 7);
  const caloriesConsumed = dayMeals.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = dayMeals.reduce((sum, m) => sum + m.proteinG, 0);

  const burnPct = (caloriesBurned / Math.max(1, state.goals.dailyCalorieBurn)) * 100;
  const activePct = (activeMinutes / Math.max(1, dailyMinTarget)) * 100;
  const stepsPct = (dayActivity.steps / Math.max(1, state.goals.dailySteps)) * 100;
  const waterPct = (dayActivity.waterMl / Math.max(1, state.goals.dailyWaterMl)) * 100;

  const recentWorkouts = [...state.workouts]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 text-balance">
            Daily Performance Summary
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {formatShortDate(selectedDate)} · Intake {caloriesConsumed.toLocaleString()} kcal · Protein{' '}
            {proteinConsumed}g / {state.goals.dailyProteinG}g
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Week day selector">
          {weekDays.map((day) => {
            const isSelected = day.iso === selectedDate;
            const hasSession = state.workouts.some((w) => w.date === day.iso);
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => onSelectDate(day.iso)}
                className={`min-h-[44px] min-w-[46px] px-2.5 py-1.5 rounded-lg border text-center transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={`block text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {day.weekdayShort}
                </span>
                <span className="block text-sm font-mono font-semibold tabular-nums">
                  {day.dayNum}
                </span>
                <span
                  className={`block mx-auto mt-0.5 w-1 h-1 rounded-full ${
                    hasSession
                      ? isSelected
                        ? 'bg-orange-400'
                        : 'bg-orange-600'
                      : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiRing
          label="Active Burn"
          valueText={`${caloriesBurned} kcal`}
          targetText={`Goal ${state.goals.dailyCalorieBurn} kcal`}
          percent={burnPct}
          statusText={burnPct >= 100 ? 'Target met' : `${Math.max(0, state.goals.dailyCalorieBurn - caloriesBurned)} kcal left`}
          accentColor={burnPct >= 100 ? 'emerald' : 'orange'}
          actionSlot={
            <button
              type="button"
              onClick={() => onOpenNewWorkout()}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 whitespace-nowrap"
            >
              + Session
            </button>
          }
        />

        <KpiRing
          label="Training Time"
          valueText={`${activeMinutes} min`}
          targetText={`Daily avg ${dailyMinTarget} min`}
          percent={activePct}
          statusText={dayWorkouts.length > 0 ? `${dayWorkouts.length} logged today` : 'No session yet'}
          accentColor={activePct >= 100 ? 'emerald' : 'slate'}
          actionSlot={
            <button
              type="button"
              onClick={onNavigateWorkouts}
              className="text-xs font-medium text-slate-700 hover:text-slate-950 whitespace-nowrap"
            >
              View log
            </button>
          }
        />

        <KpiRing
          label="Daily Steps"
          valueText={dayActivity.steps.toLocaleString()}
          targetText={`Goal ${state.goals.dailySteps.toLocaleString()}`}
          percent={stepsPct}
          statusText={stepsPct >= 100 ? 'Goal reached' : `${Math.max(0, state.goals.dailySteps - dayActivity.steps).toLocaleString()} to go`}
          accentColor={stepsPct >= 100 ? 'emerald' : 'orange'}
          actionSlot={
            <button
              type="button"
              onClick={() =>
                onUpdateActivity(selectedDate, { steps: dayActivity.steps + 1000 })
              }
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-mono font-medium text-slate-700 whitespace-nowrap"
            >
              +1k
            </button>
          }
        />

        <KpiRing
          label="Hydration"
          valueText={`${(dayActivity.waterMl / 1000).toFixed(2)} L`}
          targetText={`Goal ${(state.goals.dailyWaterMl / 1000).toFixed(2)} L`}
          percent={waterPct}
          statusText={waterPct >= 100 ? 'Hydrated' : `${Math.max(0, state.goals.dailyWaterMl - dayActivity.waterMl)} ml left`}
          accentColor={waterPct >= 100 ? 'emerald' : 'slate'}
          actionSlot={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateActivity(selectedDate, { waterMl: dayActivity.waterMl + 250 })
                }
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-mono font-medium text-slate-700 whitespace-nowrap"
              >
                +250ml
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2 flex flex-col">
          <ActivityChart
            anchorDate={todayIso}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            workouts={state.workouts}
            activities={state.activities}
            goals={state.goals}
          />
        </div>
        <div className="xl:col-span-1 flex flex-col">
          <LiveTimerCard
            onFinishSession={(durationMin, calories) =>
              onOpenNewWorkout({ durationMin, calories })
            }
          />
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-950">
              Recent Workouts
            </h2>
            <p className="text-xs text-slate-500">
              Select any session to inspect sets, splits, or edit metrics
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateWorkouts}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-orange-600 transition-colors whitespace-nowrap shrink-0"
          >
            <span>All sessions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No workouts logged yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Record your first training session or start the live stopwatch above.
            </p>
            <button
              type="button"
              onClick={() => onOpenNewWorkout()}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Session</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentWorkouts.map((session) => {
              const vol = calculateWorkoutVolumeKg(session);
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="w-full px-5 sm:px-6 py-3.5 text-left hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {session.title}
                      </span>
                      {session.isPr && (
                        <span className="text-xs font-mono font-semibold text-orange-600 shrink-0">
                          PR
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {getCategoryLabel(session.category)}
                      <span aria-hidden="true"> · </span>
                      {formatShortDate(session.date)}
                      {session.distanceKm ? (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono tabular-nums">{session.distanceKm} km</span>
                        </>
                      ) : vol > 0 ? (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono tabular-nums">{vol.toLocaleString()} kg volume</span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs font-mono font-medium text-slate-900 tabular-nums">
                        {session.durationMin} min
                      </p>
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        RPE {session.rpe}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-mono font-semibold text-slate-950 tabular-nums">
                        {session.calories} kcal
                      </p>
                      <p className="sm:hidden text-xs text-slate-500 font-mono tabular-nums">
                        {session.durationMin} min
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
