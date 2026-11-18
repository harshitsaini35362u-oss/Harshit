import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MEAL_PRESETS } from '../data/seedData';
import type { DailyActivity, FitnessGoals, MealEntry, MealPreset, MealSlot } from '../types/fitness';
import { formatShortDate, makeId } from '../utils/storage';

interface NutritionViewProps {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  meals: MealEntry[];
  activity: DailyActivity;
  goals: FitnessGoals;
  onAddMeal: (meal: MealEntry) => void;
  onDeleteMeal: (id: string) => void;
  onUpdateActivity: (iso: string, patch: Partial<DailyActivity>) => void;
}

const SLOTS: Array<{ id: MealSlot; label: string }> = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

export function NutritionView({
  selectedDate,
  onSelectDate,
  meals,
  activity,
  goals,
  onAddMeal,
  onDeleteMeal,
  onUpdateActivity,
}: NutritionViewProps) {
  const [name, setName] = useState('');
  const [slot, setSlot] = useState<MealSlot>('lunch');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [error, setError] = useState('');

  const dayMeals = meals.filter((m) => m.date === selectedDate);
  const totals = dayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const calRemaining = goals.dailyCalorieIntake - totals.calories;

  const handleQuickAdd = (preset: MealPreset) => {
    onAddMeal({
      id: makeId('m'),
      date: selectedDate,
      slot: preset.slot,
      name: preset.name,
      calories: preset.calories,
      proteinG: preset.proteinG,
      carbsG: preset.carbsG,
      fatG: preset.fatG,
    });
  };

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a meal or food name.');
      return;
    }
    const cal = Number(calories);
    if (!cal || cal <= 0) {
      setError('Enter calories greater than 0.');
      return;
    }
    setError('');
    onAddMeal({
      id: makeId('m'),
      date: selectedDate,
      slot,
      name: name.trim(),
      calories: Math.round(cal),
      proteinG: Math.max(0, Math.round(Number(proteinG) || 0)),
      carbsG: Math.max(0, Math.round(Number(carbsG) || 0)),
      fatG: Math.max(0, Math.round(Number(fatG) || 0)),
    });
    setName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
  };

  const macroRows = [
    {
      label: 'Protein',
      value: totals.proteinG,
      target: goals.dailyProteinG,
      barClass: 'bg-orange-600',
    },
    {
      label: 'Carbohydrates',
      value: totals.carbsG,
      target: goals.dailyCarbsG,
      barClass: 'bg-slate-900',
    },
    {
      label: 'Fats',
      value: totals.fatG,
      target: goals.dailyFatG,
      barClass: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Nutrition &amp; Hydration
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {formatShortDate(selectedDate)} · {totals.calories.toLocaleString()} /{' '}
            {goals.dailyCalorieIntake.toLocaleString()} kcal target
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="nutrition-date" className="text-xs font-medium text-slate-600">
            Date
          </label>
          <input
            id="nutrition-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-900 focus:border-orange-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Daily Energy Intake</p>
              <p className="mt-1 font-mono text-3xl font-bold text-slate-950 tabular-nums">
                {totals.calories.toLocaleString()} <span className="text-base font-normal text-slate-500">kcal</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">
                {calRemaining >= 0 ? 'Remaining budget' : 'Over target'}
              </p>
              <p
                className={`mt-1 font-mono text-xl font-bold tabular-nums ${
                  calRemaining >= 0 ? 'text-emerald-700' : 'text-amber-600'
                }`}
              >
                {Math.abs(calRemaining).toLocaleString()} kcal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {macroRows.map((macro) => {
              const pct = Math.min(100, Math.round((macro.value / Math.max(1, macro.target)) * 100));
              return (
                <div key={macro.label}>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">{macro.label}</span>
                    <span className="font-mono text-slate-900 font-semibold tabular-nums">
                      {macro.value}g / {macro.target}g
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${macro.barClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                    {pct}% of target
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-950">
              Hydration &amp; Recovery
            </h2>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-950 tabular-nums">
              {(activity.waterMl / 1000).toFixed(2)} L{' '}
              <span className="text-xs font-normal text-slate-500">
                / {(goals.dailyWaterMl / 1000).toFixed(2)} L
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[250, 500, 750].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() =>
                    onUpdateActivity(selectedDate, { waterMl: activity.waterMl + ml })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-mono font-medium text-slate-800"
                >
                  +{ml} ml
                </button>
              ))}
              {activity.waterMl > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateActivity(selectedDate, {
                      waterMl: Math.max(0, activity.waterMl - 250),
                    })
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-800"
                >
                  -250 ml
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600">Sleep logged</p>
              <p className="font-mono text-lg font-semibold text-slate-950 tabular-nums">
                {activity.sleepHrs.toFixed(1)} hrs
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateActivity(selectedDate, {
                    sleepHrs: Math.max(0, Number((activity.sleepHrs - 0.5).toFixed(1))),
                  })
                }
                className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 font-mono text-sm text-slate-700"
                aria-label="Decrease sleep by 0.5 hours"
              >
                -
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateActivity(selectedDate, {
                    sleepHrs: Math.min(16, Number((activity.sleepHrs + 0.5).toFixed(1))),
                  })
                }
                className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 font-mono text-sm text-slate-700"
                aria-label="Increase sleep by 0.5 hours"
              >
                +
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <section className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-950">Log Meal</h2>

          {error && (
            <p className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleCreateMeal} className="space-y-3">
            <div>
              <label htmlFor="m-slot" className="block text-xs font-medium text-slate-700 mb-1">
                Meal slot
              </label>
              <select
                id="m-slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value as MealSlot)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              >
                {SLOTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="m-name" className="block text-xs font-medium text-slate-700 mb-1">
                Food or dish
              </label>
              <input
                id="m-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Turkey Rice Bowl"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="m-cal" className="block text-xs font-medium text-slate-700 mb-1">
                  Calories
                </label>
                <input
                  id="m-cal"
                  type="number"
                  min={1}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="kcal"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="m-pro" className="block text-xs font-medium text-slate-700 mb-1">
                  Protein (g)
                </label>
                <input
                  id="m-pro"
                  type="number"
                  min={0}
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="m-carbs" className="block text-xs font-medium text-slate-700 mb-1">
                  Carbs (g)
                </label>
                <input
                  id="m-carbs"
                  type="number"
                  min={0}
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="m-fat" className="block text-xs font-medium text-slate-700 mb-1">
                  Fat (g)
                </label>
                <input
                  id="m-fat"
                  type="number"
                  min={0}
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:border-orange-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meal</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2.5">Quick presets</p>
            <div className="space-y-2">
              {MEAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickAdd(preset)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{preset.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {preset.calories} kcal · {preset.proteinG}g P
                    </p>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="font-display text-base font-semibold text-slate-950">
              Logged Meals ({dayMeals.length})
            </h2>
          </div>

          {dayMeals.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-slate-900">No meals logged for this date</p>
              <p className="mt-1 text-xs text-slate-500">
                Add a meal using the form or tap a quick preset on the left.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {SLOTS.map((slotInfo) => {
                const slotMeals = dayMeals.filter((m) => m.slot === slotInfo.id);
                if (slotMeals.length === 0) return null;
                const slotCal = slotMeals.reduce((sum, m) => sum + m.calories, 0);
                return (
                  <div key={slotInfo.id} className="p-5 sm:px-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-slate-900">{slotInfo.label}</h3>
                      <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                        {slotCal} kcal
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {slotMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="py-2.5 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {meal.name}
                            </p>
                            <p className="text-xs font-mono text-slate-500 tabular-nums">
                              P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-mono font-semibold text-slate-950 tabular-nums">
                              {meal.calories} kcal
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteMeal(meal.id)}
                              aria-label={`Delete ${meal.name}`}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
