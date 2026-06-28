const MUSCLE_EMOJI = {
  chest: '🫁',
  back: '🔙',
  shoulders: '💪',
  biceps: '💪',
  triceps: '💪',
  legs: '🦵',
  core: '🎯',
  cardio: '🏃',
  other: '⚡',
};

const MUSCLE_COLORS = {
  chest: ['#6366f1', '#7c3aed'],
  back: ['#2563eb', '#1d4ed8'],
  shoulders: ['#0891b2', '#06b6d4'],
  biceps: ['#db2777', '#ec4899'],
  triceps: ['#9333ea', '#a855f7'],
  legs: ['#059669', '#10b981'],
  core: ['#d97706', '#f59e0b'],
  cardio: ['#dc2626', '#ef4444'],
  other: ['#475569', '#64748b'],
  default: ['#475569', '#64748b'],
};

const hashString = (str) =>
  (str || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const buildPlaceholder = (muscleGroup = 'other', seed = 0) => {
  const colors = MUSCLE_COLORS[muscleGroup] || MUSCLE_COLORS.default;
  const color = colors[Math.abs(seed) % colors.length];
  const emoji = MUSCLE_EMOJI[muscleGroup] || '⚡';

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

exports.isValidImageUrl = (url) => {
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

exports.getExerciseImage = (name, muscleGroup = 'other', imageUrl = '') => {
  if (imageUrl && exports.isValidImageUrl(imageUrl)) return imageUrl;
  const seed = hashString(name || 'exercise');
  return buildPlaceholder(muscleGroup, seed);
};

exports.getRandomExerciseImage = (muscleGroup = 'other') => {
  return buildPlaceholder(muscleGroup, Math.floor(Math.random() * 1000));
};
