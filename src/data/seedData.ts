import type {
  BodyMetricEntry,
  DailyActivity,
  FitnessGoals,
  FitnessState,
  MealEntry,
  MealPreset,
  WorkoutSession,
  WorkoutTemplate,
} from '../types/fitness';

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftIsoDate(baseIso: string, deltaDays: number): string {
  const [y, m, d] = baseIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toIsoDate(dt);
}

export const DEFAULT_GOALS: FitnessGoals = {
  dailyCalorieBurn: 600,
  dailySteps: 10000,
  dailyWaterMl: 2750,
  dailyCalorieIntake: 2350,
  dailyProteinG: 165,
  dailyCarbsG: 245,
  dailyFatG: 72,
  weeklyActiveMinutes: 270,
  targetWeightKg: 64.5,
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl-push',
    title: 'Upper Body Strength',
    category: 'strength',
    durationMin: 50,
    calories: 380,
    rpe: 8,
    notes: 'Controlled eccentric tempo (3s down), 90s rest between working sets.',
    exercises: [
      {
        name: 'Barbell Bench Press',
        sets: [
          { id: 's1', weightKg: 60, reps: 8, completed: true },
          { id: 's2', weightKg: 65, reps: 6, completed: true },
          { id: 's3', weightKg: 65, reps: 6, completed: true },
        ],
      },
      {
        name: 'Overhead Dumbbell Press',
        sets: [
          { id: 's4', weightKg: 32, reps: 10, completed: true },
          { id: 's5', weightKg: 32, reps: 10, completed: true },
        ],
      },
      {
        name: 'Weighted Pull-Ups',
        sets: [
          { id: 's6', weightKg: 10, reps: 8, completed: true },
          { id: 's7', weightKg: 10, reps: 7, completed: true },
        ],
      },
    ],
  },
  {
    id: 'tpl-tempo-run',
    title: '5K Threshold Tempo Run',
    category: 'running',
    durationMin: 26,
    calories: 340,
    rpe: 8,
    distanceKm: 5.2,
    notes: '1 km warmup jog, 3.5 km threshold pace, 0.7 km cooldown.',
  },
  {
    id: 'tpl-lower',
    title: 'Lower Body & Posterior Chain',
    category: 'strength',
    durationMin: 55,
    calories: 440,
    rpe: 8,
    notes: 'Focus on full depth squats and stiff-leg hinge mechanics.',
    exercises: [
      {
        name: 'Back Squat',
        sets: [
          { id: 's1', weightKg: 85, reps: 6, completed: true },
          { id: 's2', weightKg: 90, reps: 5, completed: true },
          { id: 's3', weightKg: 90, reps: 5, completed: true },
        ],
      },
      {
        name: 'Romanian Deadlift',
        sets: [
          { id: 's4', weightKg: 80, reps: 8, completed: true },
          { id: 's5', weightKg: 80, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'tpl-mobility',
    title: 'Thoracic & Hip Mobility Flow',
    category: 'mobility',
    durationMin: 25,
    calories: 110,
    rpe: 4,
    notes: '90/90 hip switches, Jefferson curls, and shoulder CARs.',
  },
];

export const MEAL_PRESETS: MealPreset[] = [
  {
    id: 'meal-oats',
    name: 'Rolled Oats, Whey & Blueberries',
    slot: 'breakfast',
    calories: 460,
    proteinG: 36,
    carbsG: 58,
    fatG: 9,
  },
  {
    id: 'meal-chicken-bowl',
    name: 'Grilled Chicken Quinoa Bowl',
    slot: 'lunch',
    calories: 640,
    proteinG: 52,
    carbsG: 64,
    fatG: 18,
  },
  {
    id: 'meal-salmon',
    name: 'Wild Salmon, Sweet Potato & Greens',
    slot: 'dinner',
    calories: 680,
    proteinG: 46,
    carbsG: 54,
    fatG: 28,
  },
  {
    id: 'meal-yogurt',
    name: 'Greek Yogurt & Roasted Almonds',
    slot: 'snack',
    calories: 270,
    proteinG: 24,
    carbsG: 14,
    fatG: 13,
  },
];

export function createInitialFitnessState(todayIso: string = toIsoDate(new Date())): FitnessState {
  const workouts: WorkoutSession[] = [
    {
      id: 'w-today-1',
      date: todayIso,
      title: 'Morning Tempo Run',
      category: 'running',
      durationMin: 38,
      calories: 425,
      rpe: 7,
      distanceKm: 7.4,
      avgHr: 158,
      notes: 'Crisp negative splits on the final 2 km along the river path.',
      createdAt: `${todayIso}T07:15:00`,
    },
    {
      id: 'w-yest-1',
      date: shiftIsoDate(todayIso, -1),
      title: 'Lower Body Power & Squats',
      category: 'strength',
      durationMin: 56,
      calories: 460,
      rpe: 8,
      avgHr: 134,
      isPr: true,
      notes: 'Hit a clean 95 kg top set for 5 reps with zero knee cave.',
      exercises: [
        {
          id: 'ex-1',
          name: 'Barbell Back Squat',
          sets: [
            { id: 'set-1', weightKg: 80, reps: 6, completed: true },
            { id: 'set-2', weightKg: 90, reps: 5, completed: true },
            { id: 'set-3', weightKg: 95, reps: 5, completed: true },
          ],
        },
        {
          id: 'ex-2',
          name: 'Romanian Deadlift',
          sets: [
            { id: 'set-4', weightKg: 80, reps: 8, completed: true },
            { id: 'set-5', weightKg: 85, reps: 8, completed: true },
            { id: 'set-6', weightKg: 85, reps: 8, completed: true },
          ],
        },
        {
          id: 'ex-3',
          name: 'Walking Dumbbell Lunges',
          sets: [
            { id: 'set-7', weightKg: 36, reps: 12, completed: true },
            { id: 'set-8', weightKg: 36, reps: 12, completed: true },
          ],
        },
      ],
      createdAt: `${shiftIsoDate(todayIso, -1)}T17:30:00`,
    },
    {
      id: 'w-d2',
      date: shiftIsoDate(todayIso, -2),
      title: 'Zone 2 Indoor Cycling',
      category: 'cycling',
      durationMin: 48,
      calories: 410,
      rpe: 6,
      distanceKm: 24.5,
      avgHr: 138,
      notes: 'Steady 185W average power, 90 rpm cadence.',
      createdAt: `${shiftIsoDate(todayIso, -2)}T18:05:00`,
    },
    {
      id: 'w-d3',
      date: shiftIsoDate(todayIso, -3),
      title: 'Upper Body Push / Pull',
      category: 'strength',
      durationMin: 52,
      calories: 390,
      rpe: 8,
      avgHr: 129,
      exercises: [
        {
          id: 'ex-4',
          name: 'Incline Dumbbell Press',
          sets: [
            { id: 'set-9', weightKg: 48, reps: 10, completed: true },
            { id: 'set-10', weightKg: 52, reps: 8, completed: true },
            { id: 'set-11', weightKg: 52, reps: 8, completed: true },
          ],
        },
        {
          id: 'ex-5',
          name: 'Chest-Supported Row',
          sets: [
            { id: 'set-12', weightKg: 60, reps: 10, completed: true },
            { id: 'set-13', weightKg: 65, reps: 9, completed: true },
            { id: 'set-14', weightKg: 65, reps: 8, completed: true },
          ],
        },
      ],
      notes: 'Superset lateral raises with face pulls at the end.',
      createdAt: `${shiftIsoDate(todayIso, -3)}T17:45:00`,
    },
    {
      id: 'w-d4',
      date: shiftIsoDate(todayIso, -4),
      title: 'HIIT Kettlebell Conditioning',
      category: 'hiit',
      durationMin: 32,
      calories: 375,
      rpe: 9,
      avgHr: 164,
      notes: 'EMOM 24 min: 15 KB swings, 10 goblet squats, 8 burpees.',
      createdAt: `${shiftIsoDate(todayIso, -4)}T07:30:00`,
    },
    {
      id: 'w-d5',
      date: shiftIsoDate(todayIso, -5),
      title: 'Active Recovery & Mobility',
      category: 'mobility',
      durationMin: 28,
      calories: 115,
      rpe: 4,
      notes: 'Foam rolling quads, thoracic rotation, ankle dorsiflexion work.',
      createdAt: `${shiftIsoDate(todayIso, -5)}T19:10:00`,
    },
    {
      id: 'w-d6',
      date: shiftIsoDate(todayIso, -6),
      title: 'Long Aerobic Trail Run',
      category: 'running',
      durationMin: 64,
      calories: 690,
      rpe: 7,
      distanceKm: 11.8,
      avgHr: 152,
      isPr: true,
      notes: 'Felt relaxed on the climbs; hydration gel at 40 min.',
      createdAt: `${shiftIsoDate(todayIso, -6)}T08:20:00`,
    },
  ];

  const meals: MealEntry[] = [
    {
      id: 'm-1',
      date: todayIso,
      slot: 'breakfast',
      name: 'Rolled Oats, Whey & Blueberries',
      calories: 460,
      proteinG: 36,
      carbsG: 58,
      fatG: 9,
    },
    {
      id: 'm-2',
      date: todayIso,
      slot: 'lunch',
      name: 'Grilled Chicken Quinoa Bowl',
      calories: 640,
      proteinG: 52,
      carbsG: 64,
      fatG: 18,
    },
    {
      id: 'm-3',
      date: todayIso,
      slot: 'snack',
      name: 'Greek Yogurt & Roasted Almonds',
      calories: 270,
      proteinG: 24,
      carbsG: 14,
      fatG: 13,
    },
    {
      id: 'm-4',
      date: shiftIsoDate(todayIso, -1),
      slot: 'breakfast',
      name: 'Scrambled Eggs & Sourdough Toast',
      calories: 510,
      proteinG: 32,
      carbsG: 44,
      fatG: 22,
    },
    {
      id: 'm-5',
      date: shiftIsoDate(todayIso, -1),
      slot: 'lunch',
      name: 'Turkey Avocado Wrap & Fruit',
      calories: 620,
      proteinG: 44,
      carbsG: 58,
      fatG: 21,
    },
    {
      id: 'm-6',
      date: shiftIsoDate(todayIso, -1),
      slot: 'dinner',
      name: 'Wild Salmon, Sweet Potato & Greens',
      calories: 680,
      proteinG: 46,
      carbsG: 54,
      fatG: 28,
    },
  ];

  const activities: Record<string, DailyActivity> = {
    [todayIso]: { date: todayIso, steps: 8420, waterMl: 1750, sleepHrs: 7.6 },
    [shiftIsoDate(todayIso, -1)]: { date: shiftIsoDate(todayIso, -1), steps: 11240, waterMl: 2750, sleepHrs: 8.1 },
    [shiftIsoDate(todayIso, -2)]: { date: shiftIsoDate(todayIso, -2), steps: 9350, waterMl: 2500, sleepHrs: 7.4 },
    [shiftIsoDate(todayIso, -3)]: { date: shiftIsoDate(todayIso, -3), steps: 10680, waterMl: 2750, sleepHrs: 7.8 },
    [shiftIsoDate(todayIso, -4)]: { date: shiftIsoDate(todayIso, -4), steps: 12150, waterMl: 3000, sleepHrs: 7.2 },
    [shiftIsoDate(todayIso, -5)]: { date: shiftIsoDate(todayIso, -5), steps: 7180, waterMl: 2250, sleepHrs: 8.4 },
    [shiftIsoDate(todayIso, -6)]: { date: shiftIsoDate(todayIso, -6), steps: 14820, waterMl: 3250, sleepHrs: 8.0 },
  };

  const bodyMetrics: BodyMetricEntry[] = [
    { id: 'bm-1', date: shiftIsoDate(todayIso, -28), weightKg: 66.8, bodyFatPct: 16.4, restingHr: 54 },
    { id: 'bm-2', date: shiftIsoDate(todayIso, -21), weightKg: 66.4, bodyFatPct: 16.1, restingHr: 53 },
    { id: 'bm-3', date: shiftIsoDate(todayIso, -14), weightKg: 65.9, bodyFatPct: 15.8, restingHr: 52 },
    { id: 'bm-4', date: shiftIsoDate(todayIso, -7), weightKg: 65.5, bodyFatPct: 15.5, restingHr: 51 },
    { id: 'bm-5', date: todayIso, weightKg: 65.1, bodyFatPct: 15.2, restingHr: 50 },
  ];

  return {
    athleteName: 'Elena Vance',
    workouts,
    meals,
    activities,
    bodyMetrics,
    goals: DEFAULT_GOALS,
  };
}
