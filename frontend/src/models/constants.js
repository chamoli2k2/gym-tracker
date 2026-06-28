export const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Chest', emoji: '🫁' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'shoulders', label: 'Shoulders', emoji: '💪' },
  { value: 'biceps', label: 'Biceps', emoji: '💪' },
  { value: 'triceps', label: 'Triceps', emoji: '💪' },
  { value: 'legs', label: 'Legs', emoji: '🦵' },
  { value: 'core', label: 'Core', emoji: '🎯' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'other', label: 'Other', emoji: '⚡' },
];

export const DEFAULT_REST_SECONDS = 90;

export const TIMER_PRESETS = [30, 60, 90, 120, 180];

export const WEEKDAYS = [
  { value: 0, label: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
];

export const PLAN_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
];

export const getWeekdayLabel = (value) =>
  WEEKDAYS.find((d) => d.value === value)?.full || '';

export const getTodayWeekday = () => new Date().getDay();

export const getMuscleLabel = (value) =>
  MUSCLE_GROUPS.find((m) => m.value === value)?.label || value;

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateKey = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const createEmptySet = (prevSet) => ({
  weight: prevSet?.weight ?? 0,
  reps: prevSet?.reps ?? 10,
  completed: false,
  restSeconds: prevSet?.restSeconds ?? DEFAULT_REST_SECONDS,
});

export const DEFAULT_SETS = 3;
export const DEFAULT_REPS = 10;
export const DEFAULT_WEIGHT = 0;
export const SET_COUNT_OPTIONS = [1, 2, 3, 4, 5];

export const createSets = (count, weight = DEFAULT_WEIGHT, reps = DEFAULT_REPS) =>
  Array.from({ length: count }, () => ({
    weight,
    reps,
    completed: false,
    restSeconds: DEFAULT_REST_SECONDS,
  }));

export const createEmptyExercise = (
  name = '',
  muscleGroup = 'other',
  imageUrl = '',
  setCount = DEFAULT_SETS,
  weight = DEFAULT_WEIGHT,
  reps = DEFAULT_REPS
) => ({
  name,
  muscleGroup,
  notes: '',
  imageUrl,
  sets: createSets(setCount, weight, reps),
});

export const createPlanExercise = (name = '', muscleGroup = 'other', imageUrl = '') => ({
  name,
  muscleGroup,
  imageUrl,
  sets: [
    { weight: 0, reps: 10, restSeconds: DEFAULT_REST_SECONDS },
    { weight: 0, reps: 10, restSeconds: DEFAULT_REST_SECONDS },
    { weight: 0, reps: 10, restSeconds: DEFAULT_REST_SECONDS },
  ],
});

export const getCalendarDays = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
};

export const sameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getDate() === db.getDate() &&
    da.getMonth() === db.getMonth() &&
    da.getFullYear() === db.getFullYear()
  );
};

export const calcExerciseVolume = (exercise) =>
  exercise.sets.reduce(
    (total, set) => (set.completed ? total + set.weight * set.reps : total),
    0
  );

export const calcWorkoutVolume = (workout) =>
  workout?.exercises?.reduce((total, ex) => total + calcExerciseVolume(ex), 0) ?? 0;

export const calcCompletedSets = (workout) =>
  workout?.exercises?.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  ) ?? 0;
