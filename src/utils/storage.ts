import { createInitialFitnessState, shiftIsoDate, toIsoDate } from '../data/seedData';
import type { FitnessState, WorkoutCategory, WorkoutSession } from '../types/fitness';

const STORAGE_KEY = 'cadence_fitness_tracker_v1';

export function loadFitnessState(): FitnessState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialFitnessState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as FitnessState;
    if (!parsed || !Array.isArray(parsed.workouts) || !parsed.goals) {
      return createInitialFitnessState();
    }
    return parsed;
  } catch {
    return createInitialFitnessState();
  }
}

export function saveFitnessState(state: FitnessState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetFitnessState(): FitnessState {
  const initial = createInitialFitnessState();
  saveFitnessState(initial);
  return initial;
}

export function calculateWorkoutVolumeKg(session: WorkoutSession): number {
  if (!session.exercises || session.exercises.length === 0) return 0;
  return session.exercises.reduce((total, ex) => {
    const exVol = ex.sets.reduce((sSum, set) => sSum + set.weightKg * set.reps, 0);
    return total + exVol;
  }, 0);
}

export function formatPaceMinPerKm(durationMin: number, distanceKm?: number): string {
  if (!distanceKm || distanceKm <= 0) return '—';
  const totalSec = Math.round((durationMin * 60) / distanceKm);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')} /km`;
}

export function getCategoryLabel(category: WorkoutCategory): string {
  switch (category) {
    case 'strength':
      return 'Strength';
    case 'running':
      return 'Running';
    case 'cycling':
      return 'Cycling';
    case 'hiit':
      return 'HIIT';
    case 'mobility':
      return 'Mobility';
  }
}

export function formatShortDate(isoDate: string): string {
  const today = toIsoDate(new Date());
  if (isoDate === today) return 'Today';
  if (isoDate === shiftIsoDate(today, -1)) return 'Yesterday';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getWeekDates(anchorIso: string): Array<{
  iso: string;
  weekdayShort: string;
  dayNum: string;
}> {
  const result: Array<{ iso: string; weekdayShort: string; dayNum: string }> = [];
  for (let offset = -6; offset <= 0; offset++) {
    const iso = shiftIsoDate(anchorIso, offset);
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    result.push({
      iso,
      weekdayShort: dt.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      dayNum: String(d),
    });
  }
  return result;
}

export function exportWorkoutsCsv(workouts: WorkoutSession[]): void {
  const headers = [
    'Date',
    'Title',
    'Category',
    'Duration (min)',
    'Calories (kcal)',
    'RPE',
    'Distance (km)',
    'Volume (kg)',
    'Avg HR (bpm)',
    'Notes',
  ];
  const rows = workouts.map((w) => [
    w.date,
    `"${(w.title || '').replace(/"/g, '""')}"`,
    getCategoryLabel(w.category),
    w.durationMin,
    w.calories,
    w.rpe,
    w.distanceKm ?? '',
    calculateWorkoutVolumeKg(w) || '',
    w.avgHr ?? '',
    `"${(w.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(csv, `cadence-workouts-${toIsoDate(new Date())}.csv`, 'text/csv;charset=utf-8;');
}

export function exportFullJson(state: FitnessState): void {
  const json = JSON.stringify(state, null, 2);
  triggerDownload(json, `cadence-backup-${toIsoDate(new Date())}.json`, 'application/json');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
