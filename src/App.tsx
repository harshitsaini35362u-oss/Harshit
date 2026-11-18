import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BodyMetricsView } from './components/BodyMetricsView';
import { MobileBottomNav, MobileHeader } from './components/MobileNav';
import { NutritionView } from './components/NutritionView';
import { OverviewView } from './components/OverviewView';
import { SessionDetailDrawer } from './components/SessionDetailDrawer';
import { Sidebar } from './components/Sidebar';
import { WorkoutModal } from './components/WorkoutModal';
import { WorkoutsView } from './components/WorkoutsView';
import { shiftIsoDate, toIsoDate } from './data/seedData';
import type {
  AppTab,
  BodyMetricEntry,
  DailyActivity,
  FitnessGoals,
  FitnessState,
  MealEntry,
  WorkoutSession,
  WorkoutTemplate,
} from './types/fitness';
import {
  formatFullDate,
  loadFitnessState,
  resetFitnessState,
  saveFitnessState,
} from './utils/storage';

const TAB_LABELS: Record<AppTab, string> = {
  overview: 'Overview',
  workouts: 'Training Log',
  nutrition: 'Nutrition & Hydration',
  body: 'Body & Targets',
};

export default function App() {
  const todayIso = toIsoDate(new Date());
  const [state, setState] = useState<FitnessState>(() => loadFitnessState());
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [prefillTimer, setPrefillTimer] = useState<{ durationMin: number; calories: number } | null>(
    null
  );
  const [prefillTemplate, setPrefillTemplate] = useState<WorkoutTemplate | null>(null);
  const [inspectingSession, setInspectingSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    saveFitnessState(state);
  }, [state]);

  const weeklyStats = useMemo(() => {
    const cutoff = shiftIsoDate(todayIso, -6);
    const weekWorkouts = state.workouts.filter((w) => w.date >= cutoff && w.date <= todayIso);
    const weeklyMinutes = weekWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = shiftIsoDate(todayIso, -i);
      const hasActivity =
        state.workouts.some((w) => w.date === checkDate) ||
        (state.activities[checkDate]?.steps ?? 0) >= 5000;
      if (hasActivity) {
        streak += 1;
      } else {
        break;
      }
    }

    return { weeklyMinutes, streakDays: streak };
  }, [state.workouts, state.activities, todayIso]);

  const handleOpenNewWorkout = (opts?: {
    durationMin?: number;
    calories?: number;
    template?: WorkoutTemplate;
  }) => {
    setEditingSession(null);
    setPrefillTimer(
      opts?.durationMin !== undefined
        ? { durationMin: opts.durationMin, calories: opts.calories ?? 250 }
        : null
    );
    setPrefillTemplate(opts?.template ?? null);
    setWorkoutModalOpen(true);
  };

  const handleSaveWorkout = (session: WorkoutSession) => {
    setState((prev) => {
      const exists = prev.workouts.some((w) => w.id === session.id);
      const workouts = exists
        ? prev.workouts.map((w) => (w.id === session.id ? session : w))
        : [session, ...prev.workouts];
      return { ...prev, workouts };
    });
    setSelectedDate(session.date);
  };

  const handleDeleteWorkout = (id: string) => {
    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
  };

  const handleUpdateActivity = (iso: string, patch: Partial<DailyActivity>) => {
    setState((prev) => {
      const current = prev.activities[iso] ?? {
        date: iso,
        steps: 0,
        waterMl: 0,
        sleepHrs: 7.5,
      };
      return {
        ...prev,
        activities: {
          ...prev.activities,
          [iso]: { ...current, ...patch },
        },
      };
    });
  };

  const handleAddMeal = (meal: MealEntry) => {
    setState((prev) => ({
      ...prev,
      meals: [meal, ...prev.meals],
    }));
  };

  const handleDeleteMeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
  };

  const handleAddBodyMetric = (entry: BodyMetricEntry) => {
    setState((prev) => ({
      ...prev,
      bodyMetrics: [...prev.bodyMetrics, entry],
    }));
  };

  const handleDeleteBodyMetric = (id: string) => {
    setState((prev) => ({
      ...prev,
      bodyMetrics: prev.bodyMetrics.filter((b) => b.id !== id),
    }));
  };

  const handleUpdateGoals = (goals: FitnessGoals) => {
    setState((prev) => ({ ...prev, goals }));
  };

  const handleResetAll = () => {
    const fresh = resetFitnessState();
    setState(fresh);
    setSelectedDate(toIsoDate(new Date()));
  };

  const currentActivity = state.activities[selectedDate] ?? {
    date: selectedDate,
    steps: 0,
    waterMl: 0,
    sleepHrs: 7.5,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        athleteName={state.athleteName}
        weeklyMinutes={weeklyStats.weeklyMinutes}
        weeklyGoalMinutes={state.goals.weeklyActiveMinutes}
        streakDays={weeklyStats.streakDays}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader onOpenLogWorkout={() => handleOpenNewWorkout()} />

        <header className="hidden lg:flex items-center justify-between gap-8 px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap shrink-0">
            <span className="font-medium text-slate-900">Cadence</span>
            <span aria-hidden="true">/</span>
            <span>{TAB_LABELS[activeTab]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-xs tabular-nums">{formatFullDate(selectedDate)}</span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenNewWorkout()}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {activeTab === 'overview' && (
            <OverviewView
              state={state}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onUpdateActivity={handleUpdateActivity}
              onOpenNewWorkout={(prefill) => handleOpenNewWorkout(prefill)}
              onSelectSession={setInspectingSession}
              onNavigateWorkouts={() => setActiveTab('workouts')}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutsView
              workouts={state.workouts}
              onOpenNewWorkout={(tpl) => handleOpenNewWorkout({ template: tpl })}
              onSelectSession={setInspectingSession}
            />
          )}

          {activeTab === 'nutrition' && (
            <NutritionView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              meals={state.meals}
              activity={currentActivity}
              goals={state.goals}
              onAddMeal={handleAddMeal}
              onDeleteMeal={handleDeleteMeal}
              onUpdateActivity={handleUpdateActivity}
            />
          )}

          {activeTab === 'body' && (
            <BodyMetricsView
              state={state}
              onAddMetric={handleAddBodyMetric}
              onDeleteMetric={handleDeleteBodyMetric}
              onUpdateGoals={handleUpdateGoals}
              onResetAll={handleResetAll}
            />
          )}
        </main>
      </div>

      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => {
          setWorkoutModalOpen(false);
          setEditingSession(null);
          setPrefillTimer(null);
          setPrefillTemplate(null);
        }}
        onSave={handleSaveWorkout}
        initialDate={selectedDate}
        editingSession={editingSession}
        prefillDurationMin={prefillTimer?.durationMin}
        prefillCalories={prefillTimer?.calories}
        prefillTemplate={prefillTemplate}
      />

      <SessionDetailDrawer
        session={inspectingSession}
        onClose={() => setInspectingSession(null)}
        onEdit={(session) => {
          setEditingSession(session);
          setPrefillTimer(null);
          setPrefillTemplate(null);
          setWorkoutModalOpen(true);
        }}
        onDelete={handleDeleteWorkout}
      />
    </div>
  );
}
