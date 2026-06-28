import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MUSCLE_GROUPS,
  createEmptyExercise,
  SET_COUNT_OPTIONS,
  DEFAULT_SETS,
  DEFAULT_REPS,
  DEFAULT_WEIGHT,
} from '../models/constants';
import { QUICK_EXERCISES, isValidImageUrl } from '../models/exerciseImages';
import { templateService } from '../services/api';
import ExerciseImage from './ExerciseImage';
import NumberStepper from './NumberStepper';
import './AddExerciseModal.css';

function buildExercise(name, muscleGroup, templates, config) {
  const { setCount, weight, reps } = config;
  const template = templates.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  const group = template?.muscleGroup || muscleGroup;
  let finalImage = '';
  if (template?.imageUrl && isValidImageUrl(template.imageUrl)) {
    finalImage = template.imageUrl;
  }

  const finalSets = template?.defaultSets || setCount;
  const finalWeight = template?.defaultWeight ?? weight;
  const finalReps = template?.defaultReps ?? reps;

  return createEmptyExercise(
    name,
    group,
    finalImage,
    finalSets,
    finalWeight,
    finalReps
  );
}

export default function AddExerciseModal({ onAdd, onClose }) {
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [setCount, setSetCount] = useState(DEFAULT_SETS);
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [reps, setReps] = useState(DEFAULT_REPS);
  const [templates, setTemplates] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    templateService.getAll().then(setTemplates).catch(() => {});
    searchRef.current?.focus();
  }, []);

  const allExercises = useMemo(() => {
    const fromQuick = QUICK_EXERCISES[muscleGroup] || [];
    const fromTemplates = templates
      .filter((t) => t.muscleGroup === muscleGroup)
      .map((t) => t.name);
    return [...new Set([...fromQuick, ...fromTemplates])];
  }, [muscleGroup, templates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allExercises;
    const q = search.toLowerCase();
    return allExercises.filter((n) => n.toLowerCase().includes(q));
  }, [allExercises, search]);

  const displayName = selected || search.trim();
  const canAdd = displayName.length > 0;

  const selectExercise = (name) => {
    setSelected(name);
    setSearch(name);
    const template = templates.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (template) {
      setSetCount(template.defaultSets || DEFAULT_SETS);
      setWeight(template.defaultWeight ?? DEFAULT_WEIGHT);
      setReps(template.defaultReps ?? DEFAULT_REPS);
    }
  };

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(
      buildExercise(displayName, muscleGroup, templates, { setCount, weight, reps })
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal add-exercise-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="add-exercise-header">
          <h2>Add Exercise</h2>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          ref={searchRef}
          type="search"
          className="exercise-search"
          placeholder="Search or type exercise name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(null);
          }}
        />

        <div className="muscle-chips">
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg.value}
              type="button"
              className={`muscle-chip${muscleGroup === mg.value ? ' active' : ''}`}
              onClick={() => {
                setMuscleGroup(mg.value);
                setSelected(null);
              }}
            >
              <span>{mg.emoji}</span>
              <span>{mg.label}</span>
            </button>
          ))}
        </div>

        <div className="exercise-pick-list">
          {filtered.length === 0 && search.trim() ? (
            <button
              type="button"
              className="exercise-pick-item custom-pick"
              onClick={() => setSelected(search.trim())}
            >
              <ExerciseImage
                exercise={{ name: search.trim(), muscleGroup }}
                className="pick-img"
                alt=""
              />
              <span>Add "{search.trim()}"</span>
            </button>
          ) : (
            filtered.map((name) => (
              <button
                key={name}
                type="button"
                className={`exercise-pick-item${selected === name ? ' selected' : ''}`}
                onClick={() => selectExercise(name)}
              >
                <ExerciseImage
                  exercise={{ name, muscleGroup }}
                  className="pick-img"
                  alt=""
                />
                <span>{name}</span>
                {selected === name && <span className="pick-check">✓</span>}
              </button>
            ))
          )}
        </div>

        {canAdd && (
          <div className="add-config-panel">
            <div className="config-preview">
              <ExerciseImage
                exercise={{ name: displayName, muscleGroup }}
                className="config-preview-img"
                alt=""
              />
              <strong>{displayName}</strong>
            </div>

            <div className="config-sets-row">
              <span className="config-label">Sets</span>
              <div className="set-count-pills">
                {SET_COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`set-pill${setCount === n ? ' active' : ''}`}
                    onClick={() => setSetCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="config-steppers">
              <NumberStepper
                label="Weight"
                unit="kg"
                value={weight}
                onChange={setWeight}
                step={2.5}
              />
              <NumberStepper
                label="Reps"
                value={reps}
                onChange={setReps}
                step={1}
                min={1}
              />
            </div>

            <button type="button" className="btn btn-primary btn-block add-confirm-btn" onClick={handleAdd}>
              Add {setCount} Sets to Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
