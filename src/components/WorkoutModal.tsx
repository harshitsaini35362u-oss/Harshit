import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WORKOUT_TEMPLATES } from '../data/seedData';
import type {
  ExerciseEntry,
  WorkoutCategory,
  WorkoutSession,
  WorkoutTemplate,
} from '../types/fitness';
import { formatPaceMinPerKm, makeId } from '../utils/storage';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: WorkoutSession) => void;
  initialDate: string;
  editingSession?: WorkoutSession | null;
  prefillDurationMin?: number;
  prefillCalories?: number;
  prefillTemplate?: WorkoutTemplate | null;
}

const CATEGORIES: Array<{ id: WorkoutCategory; label: string }> = [
  { id: 'strength', label: 'Strength' },
  { id: 'running', label: 'Running' },
  { id: 'cycling', label: 'Cycling' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'mobility', label: 'Mobility' },
];

export function WorkoutModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingSession,
  prefillDurationMin,
  prefillCalories,
  prefillTemplate,
}: WorkoutModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [date, setDate] = useState(initialDate);
  const [durationMin, setDurationMin] = useState(45);
  const [calories, setCalories] = useState(350);
  const [rpe, setRpe] = useState(7);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [avgHr, setAvgHr] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isPr, setIsPr] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (editingSession) {
      setTitle(editingSession.title);
      setCategory(editingSession.category);
      setDate(editingSession.date);
      setDurationMin(editingSession.durationMin);
      setCalories(editingSession.calories);
      setRpe(editingSession.rpe);
      setDistanceKm(editingSession.distanceKm ? String(editingSession.distanceKm) : '');
      setAvgHr(editingSession.avgHr ? String(editingSession.avgHr) : '');
      setNotes(editingSession.notes ?? '');
      setIsPr(Boolean(editingSession.isPr));
      setExercises(editingSession.exercises ? structuredClone(editingSession.exercises) : []);
      return;
    }

    if (prefillTemplate) {
      applyTemplate(prefillTemplate, initialDate);
      return;
    }

    setTitle('');
    setCategory('strength');
    setDate(initialDate);
    setDurationMin(prefillDurationMin ?? 45);
    setCalories(prefillCalories ?? 350);
    setRpe(7);
    setDistanceKm('');
    setAvgHr('');
    setNotes('');
    setIsPr(false);
    setExercises([
      {
        id: makeId('ex'),
        name: 'Primary Lift',
        sets: [
          { id: makeId('set'), weightKg: 60, reps: 8, completed: true },
          { id: makeId('set'), weightKg: 60, reps: 8, completed: true },
        ],
      },
    ]);
  }, [isOpen, editingSession, initialDate, prefillDurationMin, prefillCalories, prefillTemplate]);

  const applyTemplate = (tpl: WorkoutTemplate, targetDate = date) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setDate(targetDate);
    setDurationMin(tpl.durationMin);
    setCalories(tpl.calories);
    setRpe(tpl.rpe);
    setDistanceKm(tpl.distanceKm ? String(tpl.distanceKm) : '');
    setNotes(tpl.notes);
    setExercises(
      tpl.exercises
        ? tpl.exercises.map((ex) => ({
            id: makeId('ex'),
            name: ex.name,
            sets: ex.sets.map((s) => ({ ...s, id: makeId('set') })),
          }))
        : []
    );
  };

  if (!isOpen) return null;

  const totalVolumeKg = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weightKg * set.reps, 0),
    0
  );

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: makeId('ex'),
        name: '',
        sets: [{ id: makeId('set'), weightKg: 40, reps: 10, completed: true }],
      },
    ]);
  };

  const handleRemoveExercise = (exId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exId));
  };

  const handleExerciseName = (exId: string, name: string) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exId ? { ...ex, name } : ex)));
  };

  const handleAddSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: makeId('set'),
              weightKg: last ? last.weightKg : 40,
              reps: last ? last.reps : 10,
              completed: true,
            },
          ],
        };
      })
    );
  };

  const handleUpdateSet = (
    exId: string,
    setId: string,
    field: 'weightKg' | 'reps',
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, [field]: Math.max(0, value) } : s
          ),
        };
      })
    );
  };

  const handleRemoveSet = (exId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Enter a workout title before saving.');
      return;
    }
    if (durationMin <= 0) {
      setError('Duration must be at least 1 minute.');
      return;
    }

    const cleanedExercises =
      category === 'strength' || category === 'hiit'
        ? exercises
            .filter((ex) => ex.name.trim().length > 0 && ex.sets.length > 0)
            .map((ex) => ({ ...ex, name: ex.name.trim() }))
        : undefined;

    const session: WorkoutSession = {
      id: editingSession?.id ?? makeId('w'),
      date,
      title: cleanTitle,
      category,
      durationMin: Math.round(durationMin),
      calories: Math.max(0, Math.round(calories)),
      rpe,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      avgHr: avgHr ? Number(avgHr) : undefined,
      exercises: cleanedExercises && cleanedExercises.length > 0 ? cleanedExercises : undefined,
      notes: notes.trim() || undefined,
      isPr,
      createdAt: editingSession?.createdAt ?? new Date().toISOString(),
    };

    onSave(session);
    onClose();
  };

  const parsedDist = distanceKm ? Number(distanceKm) : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-modal-title"
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h2 id="workout-modal-title" className="font-display text-lg font-semibold text-slate-950">
            {editingSession ? 'Edit Workout Session' : 'Log Workout Session'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          {!editingSession && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Quick templates</p>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="w-title" className="block text-xs font-medium text-slate-700 mb-1.5">
                Session title
              </label>
              <input
                id="w-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Tempo Run or Lower Body Squat Day"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="w-date" className="block text-xs font-medium text-slate-700 mb-1.5">
                Date
              </label>
              <input
                id="w-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">Category</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="w-duration" className="block text-xs font-medium text-slate-700 mb-1.5">
                Duration (min)
              </label>
              <input
                id="w-duration"
                type="number"
                min={1}
                max={600}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="w-calories" className="block text-xs font-medium text-slate-700 mb-1.5">
                Calories (kcal)
              </label>
              <input
                id="w-calories"
                type="number"
                min={0}
                max={4000}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="w-distance" className="block text-xs font-medium text-slate-700 mb-1.5">
                Distance (km)
              </label>
              <input
                id="w-distance"
                type="number"
                step="0.1"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="Optional"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="w-hr" className="block text-xs font-medium text-slate-700 mb-1.5">
                Avg HR (bpm)
              </label>
              <input
                id="w-hr"
                type="number"
                min={40}
                max={220}
                value={avgHr}
                onChange={(e) => setAvgHr(e.target.value)}
                placeholder="Optional"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          {parsedDist && parsedDist > 0 ? (
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Calculated average pace: <span className="text-slate-900 font-medium">{formatPaceMinPerKm(durationMin, parsedDist)}</span>
            </p>
          ) : null}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-700">Perceived Effort (RPE 1–10)</span>
              <span className="text-xs font-mono font-semibold text-orange-600 tabular-nums">
                RPE {rpe} / 10
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRpe(val)}
                  className={`h-9 rounded-md text-xs font-mono font-semibold transition-colors ${
                    rpe === val
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {(category === 'strength' || category === 'hiit') && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Exercises &amp; Sets</h3>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Total session volume: {totalVolumeKg.toLocaleString()} kg
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Exercise</span>
                </button>
              </div>

              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => handleExerciseName(ex.id, e.target.value)}
                        placeholder={`Exercise ${idx + 1} (e.g., Back Squat)`}
                        className="flex-1 h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(ex.id)}
                        aria-label="Remove exercise"
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {ex.sets.map((set, sIdx) => (
                        <div key={set.id} className="grid grid-cols-12 items-center gap-2">
                          <span className="col-span-2 text-xs font-mono text-slate-500 tabular-nums">
                            Set {sIdx + 1}
                          </span>
                          <div className="col-span-4 flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              value={set.weightKg}
                              onChange={(e) =>
                                handleUpdateSet(ex.id, set.id, 'weightKg', Number(e.target.value))
                              }
                              aria-label={`Set ${sIdx + 1} weight in kg`}
                              className="w-full h-8 px-2 rounded border border-slate-200 bg-white text-xs font-mono tabular-nums text-slate-900"
                            />
                            <span className="text-xs text-slate-500">kg</span>
                          </div>
                          <div className="col-span-4 flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSet(ex.id, set.id, 'reps', Number(e.target.value))
                              }
                              aria-label={`Set ${sIdx + 1} reps`}
                              className="w-full h-8 px-2 rounded border border-slate-200 bg-white text-xs font-mono tabular-nums text-slate-900"
                            />
                            <span className="text-xs text-slate-500">reps</span>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(ex.id, set.id)}
                              disabled={ex.sets.length <= 1}
                              aria-label="Remove set"
                              className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(ex.id)}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      + Add set
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="w-notes" className="block text-xs font-medium text-slate-700 mb-1.5">
              Session notes
            </label>
            <textarea
              id="w-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Splits, technique cues, recovery feel..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPr}
              onChange={(e) => setIsPr(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
            />
            <span className="text-xs font-medium text-slate-700">
              Mark as Personal Record (PR)
            </span>
          </label>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {editingSession ? 'Save Changes' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
