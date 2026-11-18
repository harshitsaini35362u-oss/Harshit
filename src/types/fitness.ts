export type AppTab = 'overview' | 'workouts' | 'nutrition' | 'body';

export type WorkoutCategory = 'strength' | 'running' | 'cycling' | 'hiit' | 'mobility';

export interface StrengthSet {
  id: string;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets: StrengthSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: WorkoutCategory;
  durationMin: number;
  calories: number;
  rpe: number; // 1-10
  distanceKm?: number;
  avgHr?: number;
  exercises?: ExerciseEntry[];
  notes?: string;
  isPr?: boolean;
  createdAt: string;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  steps: number;
  waterMl: number;
  sleepHrs: number;
}

export interface BodyMetricEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number;
  restingHr?: number;
}

export interface FitnessGoals {
  dailyCalorieBurn: number;
  dailySteps: number;
  dailyWaterMl: number;
  dailyCalorieIntake: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  weeklyActiveMinutes: number;
  targetWeightKg: number;
}

export interface FitnessState {
  athleteName: string;
  workouts: WorkoutSession[];
  meals: MealEntry[];
  activities: Record<string, DailyActivity>;
  bodyMetrics: BodyMetricEntry[];
  goals: FitnessGoals;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  category: WorkoutCategory;
  durationMin: number;
  calories: number;
  rpe: number;
  distanceKm?: number;
  exercises?: Omit<ExerciseEntry, 'id'>[];
  notes: string;
}

export interface MealPreset {
  id: string;
  name: string;
  slot: MealSlot;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
