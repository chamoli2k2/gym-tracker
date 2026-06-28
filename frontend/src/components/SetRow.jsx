import NumberStepper from './NumberStepper';
import './SetRow.css';

export default function SetRow({
  set,
  setIndex,
  onUpdate,
  onToggleComplete,
  isActive,
}) {
  if (set.completed) {
    return (
      <button
        type="button"
        className="set-row set-row-done"
        onClick={() => onToggleComplete(setIndex)}
      >
        <span className="set-done-label">Set {setIndex + 1}</span>
        <span className="set-done-value">
          {set.weight} kg × {set.reps}
        </span>
        <span className="set-done-check">✓</span>
      </button>
    );
  }

  return (
    <div className={`set-row set-row-active${isActive ? ' current' : ''}`}>
      <div className="set-active-header">
        <span className="set-number">Set {setIndex + 1}</span>
        {isActive && <span className="set-active-badge">Current</span>}
      </div>

      <div className="set-steppers-row">
        <NumberStepper
          label="Weight"
          unit="kg"
          value={set.weight || 0}
          onChange={(v) => onUpdate(setIndex, 'weight', v)}
          step={2.5}
          min={0}
        />
        <NumberStepper
          label="Reps"
          value={set.reps || 0}
          onChange={(v) => onUpdate(setIndex, 'reps', v)}
          step={1}
          min={1}
        />
      </div>

      <button
        type="button"
        className="log-set-btn"
        onClick={() => onToggleComplete(setIndex)}
      >
        Log Set ✓
      </button>
    </div>
  );
}
