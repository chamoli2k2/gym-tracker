import { useRef } from 'react';
import { getMuscleLabel, calcExerciseVolume } from '../models/constants';
import { uploadService } from '../services/api';
import ExerciseImage from './ExerciseImage';
import SetRow from './SetRow';
import './ExerciseCard.css';

export default function ExerciseCard({
  exercise,
  exerciseIndex,
  onUpdate,
  onRemove,
  onSetComplete,
}) {
  const fileRef = useRef(null);
  const volume = calcExerciseVolume(exercise);
  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const firstIncompleteIndex = exercise.sets.findIndex((s) => !s.completed);

  const updateSet = (setIndex, field, value) => {
    const sets = exercise.sets.map((set, i) =>
      i === setIndex ? { ...set, [field]: value } : set
    );
    onUpdate(exerciseIndex, { ...exercise, sets });
  };

  const toggleSetComplete = (setIndex) => {
    const wasIncomplete = !exercise.sets[setIndex].completed;
    const sets = exercise.sets.map((set, i) =>
      i === setIndex ? { ...set, completed: !set.completed } : set
    );
    onUpdate(exerciseIndex, { ...exercise, sets });

    if (wasIncomplete && onSetComplete) {
      onSetComplete(exercise.sets[setIndex].restSeconds || 90);
    }
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    onUpdate(exerciseIndex, {
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          weight: lastSet?.weight ?? 0,
          reps: lastSet?.reps ?? 10,
          completed: false,
          restSeconds: lastSet?.restSeconds ?? 90,
        },
      ],
    });
  };

  const applyWeightToAll = () => {
    const weight = exercise.sets[firstIncompleteIndex]?.weight ?? 0;
    onUpdate(exerciseIndex, {
      ...exercise,
      sets: exercise.sets.map((s) => ({ ...s, weight })),
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadService.image(file);
      onUpdate(exerciseIndex, { ...exercise, imageUrl: url });
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <button
          type="button"
          className="exercise-thumb-btn"
          onClick={() => fileRef.current?.click()}
          title="Change photo"
        >
          <ExerciseImage exercise={exercise} alt={exercise.name} className="exercise-thumb" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleImageChange}
        />
        <div className="exercise-header-info">
          <h3 className="exercise-name">{exercise.name}</h3>
          <span className="exercise-progress-text">
            {completedCount}/{exercise.sets.length} sets · {volume.toLocaleString()} kg
          </span>
        </div>
        <button className="btn-ghost btn-sm" onClick={() => onRemove(exerciseIndex)}>
          ✕
        </button>
      </div>

      <div className="sets-container">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={set._id || setIndex}
            set={set}
            setIndex={setIndex}
            onUpdate={updateSet}
            onToggleComplete={toggleSetComplete}
            isActive={setIndex === firstIncompleteIndex}
          />
        ))}
      </div>

      <div className="exercise-footer">
        <button className="btn btn-secondary btn-sm" onClick={addSet}>
          + Set
        </button>
        {firstIncompleteIndex > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={applyWeightToAll}>
            Copy weight
          </button>
        )}
      </div>
    </div>
  );
}
