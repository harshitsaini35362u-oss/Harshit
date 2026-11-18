import { Edit2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { WorkoutSession } from '../types/fitness';
import {
  calculateWorkoutVolumeKg,
  formatFullDate,
  formatPaceMinPerKm,
  getCategoryLabel,
} from '../utils/storage';

interface SessionDetailDrawerProps {
  session: WorkoutSession | null;
  onClose: () => void;
  onEdit: (session: WorkoutSession) => void;
  onDelete: (id: string) => void;
}

export function SessionDetailDrawer({
  session,
  onClose,
  onEdit,
  onDelete,
}: SessionDetailDrawerProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!session) return null;

  const volumeKg = calculateWorkoutVolumeKg(session);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-session-title"
    >
      <div className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col justify-between overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">
              {getCategoryLabel(session.category)} · {formatFullDate(session.date)}
            </p>
            <h2
              id="drawer-session-title"
              className="font-display text-lg font-semibold text-slate-950 truncate"
            >
              {session.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmingDelete(false);
              onClose();
            }}
            aria-label="Close session details"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {session.isPr && (
            <p className="text-xs font-semibold text-orange-600">
              Personal Record achieved in this session
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-950 tabular-nums">
                {session.durationMin} min
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Energy burned</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-950 tabular-nums">
                {session.calories} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Effort (RPE)</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-950 tabular-nums">
                {session.rpe} / 10
              </p>
            </div>
            {session.distanceKm ? (
              <div>
                <p className="text-xs text-slate-500">Distance &amp; Pace</p>
                <p className="mt-1 font-mono text-base font-bold text-slate-950 tabular-nums">
                  {session.distanceKm} km · {formatPaceMinPerKm(session.durationMin, session.distanceKm)}
                </p>
              </div>
            ) : volumeKg > 0 ? (
              <div>
                <p className="text-xs text-slate-500">Total Volume</p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-950 tabular-nums">
                  {volumeKg.toLocaleString()} kg
                </p>
              </div>
            ) : session.avgHr ? (
              <div>
                <p className="text-xs text-slate-500">Avg Heart Rate</p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-950 tabular-nums">
                  {session.avgHr} bpm
                </p>
              </div>
            ) : null}
          </div>

          {session.exercises && session.exercises.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">
                Strength Breakdown
              </h3>
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {session.exercises.map((ex) => {
                  const exVol = ex.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
                  return (
                    <div key={ex.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <p className="text-sm font-medium text-slate-900">{ex.name}</p>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {exVol.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="space-y-1">
                        {ex.sets.map((s, idx) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums"
                          >
                            <span>Set {idx + 1}</span>
                            <span>
                              {s.weightKg} kg × {s.reps} reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {session.notes && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-1.5">Session Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {confirmingDelete ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-xs font-medium text-red-700">Delete this session?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(session.id);
                    setConfirmingDelete(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(session);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Session</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
