import { MUSCLE_GROUPS } from './constants';
import { resolveMediaUrl } from '../config/env';

const MUSCLE_COLORS = {
  chest: ['#6366f1', '#7c3aed', '#4f46e5'],
  back: ['#2563eb', '#1d4ed8', '#3b82f6'],
  shoulders: ['#0891b2', '#0e7490', '#06b6d4'],
  biceps: ['#db2777', '#be185d', '#ec4899'],
  triceps: ['#9333ea', '#7e22ce', '#a855f7'],
  legs: ['#059669', '#047857', '#10b981'],
  core: ['#d97706', '#b45309', '#f59e0b'],
  cardio: ['#dc2626', '#b91c1c', '#ef4444'],
  other: ['#475569', '#334155', '#64748b'],
  default: ['#475569', '#334155', '#64748b'],
};

const hashString = (str) =>
  (str || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/uploads/')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const getMusclePlaceholder = (muscleGroup = 'other', seed = 0) => {
  const mg =
    MUSCLE_GROUPS.find((m) => m.value === muscleGroup) ||
    MUSCLE_GROUPS.find((m) => m.value === 'other');
  const colors = MUSCLE_COLORS[muscleGroup] || MUSCLE_COLORS.default;
  const color = colors[Math.abs(seed) % colors.length];
  const emoji = mg?.emoji || '⚡';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g)" rx="14"/>
    <text x="50" y="58" font-size="34" text-anchor="middle">${emoji}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const ULTIMATE_FALLBACK = getMusclePlaceholder('other', 0);

export const getExerciseImage = (exercise) => {
  if (exercise?.imageUrl && isValidImageUrl(exercise.imageUrl)) {
    return resolveMediaUrl(exercise.imageUrl);
  }
  const muscle = exercise?.muscleGroup || 'other';
  const seed = hashString(exercise?.name || 'exercise');
  return getMusclePlaceholder(muscle, seed);
};

export const getRandomExerciseImage = (muscleGroup = 'other') => {
  const seed = Math.floor(Math.random() * 1000);
  return getMusclePlaceholder(muscleGroup, seed);
};

export const QUICK_EXERCISES = {
  chest: ['Bench Press', 'Incline Press', 'Cable Fly', 'Push Ups', 'Dumbbell Press'],
  back: ['Deadlift', 'Pull Ups', 'Barbell Row', 'Lat Pulldown', 'Seated Row'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Arnold Press'],
  biceps: ['Barbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'],
  triceps: ['Tricep Pushdown', 'Skull Crushers', 'Dips', 'Overhead Extension'],
  legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Curl'],
  core: ['Plank', 'Crunches', 'Leg Raises', 'Russian Twist'],
  cardio: ['Treadmill', 'Cycling', 'Rowing', 'Jump Rope'],
  other: ['Stretching', 'Warm Up', 'Cool Down'],
};

export const getFallbackChain = (exercise) => {
  const muscle = exercise?.muscleGroup || 'other';
  const seed = hashString(exercise?.name || 'exercise');
  const primary = getExerciseImage(exercise);
  const placeholder = getMusclePlaceholder(muscle, seed);

  if (primary === placeholder) {
    return [primary, ULTIMATE_FALLBACK];
  }
  return [primary, placeholder, ULTIMATE_FALLBACK];
};
