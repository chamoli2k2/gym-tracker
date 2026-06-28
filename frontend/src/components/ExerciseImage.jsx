import { useState, useEffect, useMemo } from 'react';
import { getFallbackChain, ULTIMATE_FALLBACK } from '../models/exerciseImages';
import './ExerciseImage.css';

export default function ExerciseImage({
  exercise,
  className = '',
  alt = '',
  ...props
}) {
  const chain = useMemo(() => getFallbackChain(exercise), [
    exercise?.imageUrl,
    exercise?.name,
    exercise?.muscleGroup,
  ]);
  const [index, setIndex] = useState(0);
  const src = chain[index] || ULTIMATE_FALLBACK;

  useEffect(() => {
    setIndex(0);
  }, [chain]);

  const handleError = () => {
    setIndex((current) => (current < chain.length - 1 ? current + 1 : current));
  };

  return (
    <img
      src={src}
      alt={alt || exercise?.name || 'Exercise'}
      className={`exercise-image ${className}`.trim()}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
