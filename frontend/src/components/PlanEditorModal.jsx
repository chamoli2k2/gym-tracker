import { useState, useEffect } from 'react';
import {
  MUSCLE_GROUPS,
  PLAN_COLORS,
  createPlanExercise,
} from '../models/constants';
import { templateService } from '../services/api';
import './PlanEditorModal.css';

export default function PlanEditorModal({ plan, weekday, onSave, onClose }) {
  const [name, setName] = useState(plan?.name || '');
  const [color, setColor] = useState(plan?.color || PLAN_COLORS[0]);
  const [exercises, setExercises] = useState(
    plan?.exercises?.length
      ? plan.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        }))
      : []
  );
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    templateService.getAll().then(setTemplates).catch(() => {});
  }, []);

  const addExercise = () => {
    setExercises([...exercises, createPlanExercise()]);
  };

  const updateExercise = (index, field, value) => {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setExercises(
      exercises.map((ex, i) => {
        if (i !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) =>
            si === setIndex ? { ...s, [field]: Number(value) || 0 } : s
          ),
        };
      })
    );
  };

  const addSet = (exIndex) => {
    setExercises(
      exercises.map((ex, i) => {
        if (i !== exIndex) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              weight: last?.weight ?? 0,
              reps: last?.reps ?? 10,
              restSeconds: last?.restSeconds ?? 90,
            },
          ],
        };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        weekday,
        name: name.trim(),
        color,
        exercises: exercises.filter((ex) => ex.name.trim()),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal plan-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2>{plan ? 'Edit Plan' : 'New Workout Plan'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plan Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chest & Biceps"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PLAN_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${color === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="plan-exercises-section">
            <div className="section-header">
              <label>Exercises</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addExercise}>
                + Add
              </button>
            </div>

            {exercises.length === 0 ? (
              <p className="hint-text">Add exercises to this plan folder</p>
            ) : (
              exercises.map((ex, exIndex) => (
                <div key={exIndex} className="plan-exercise-block">
                  <div className="plan-exercise-header">
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(exIndex, 'name', e.target.value)}
                      placeholder="Exercise name"
                      list="plan-template-list"
                    />
                    <select
                      value={ex.muscleGroup}
                      onChange={(e) =>
                        updateExercise(exIndex, 'muscleGroup', e.target.value)
                      }
                    >
                      {MUSCLE_GROUPS.map((mg) => (
                        <option key={mg.value} value={mg.value}>
                          {mg.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeExercise(exIndex)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="plan-sets-grid">
                    {ex.sets.map((set, setIndex) => (
                      <div key={setIndex} className="plan-set-row">
                        <span className="set-num">{setIndex + 1}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={set.weight || ''}
                          onChange={(e) =>
                            updateSet(exIndex, setIndex, 'weight', e.target.value)
                          }
                          placeholder="kg"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps || ''}
                          onChange={(e) =>
                            updateSet(exIndex, setIndex, 'reps', e.target.value)
                          }
                          placeholder="reps"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm add-set-btn"
                      onClick={() => addSet(exIndex)}
                    >
                      + Set
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <datalist id="plan-template-list">
            {templates.map((t) => (
              <option key={t._id} value={t.name} />
            ))}
          </datalist>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
