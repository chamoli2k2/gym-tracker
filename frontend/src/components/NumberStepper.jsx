import './NumberStepper.css';

export default function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  label,
  unit,
}) {
  const adjust = (delta) => {
    const next = Math.round((value + delta) * 10) / 10;
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div className="number-stepper">
      {label && <span className="stepper-label">{label}</span>}
      <div className="stepper-controls">
        <button type="button" className="stepper-btn" onClick={() => adjust(-step)}>
          −
        </button>
        <div className="stepper-value">
          <strong>{value}</strong>
          {unit && <small>{unit}</small>}
        </div>
        <button type="button" className="stepper-btn" onClick={() => adjust(step)}>
          +
        </button>
      </div>
    </div>
  );
}
