import { useRestTimer } from '../controllers/useTimerController';
import { TIMER_PRESETS } from '../models/constants';
import './RestTimer.css';

export default function RestTimer({ defaultSeconds = 90, compact = false }) {
  const { seconds, isRunning, isFinished, start, pause, reset, setDuration } =
    useRestTimer(defaultSeconds);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = defaultSeconds > 0 ? ((defaultSeconds - seconds) / defaultSeconds) * 100 : 0;

  if (compact) {
    return (
      <div className={`rest-timer-compact${isRunning ? ' active' : ''}${isFinished ? ' finished' : ''}`}>
        <span className="timer-display-sm">
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        {!isRunning ? (
          <button className="btn btn-sm btn-primary" onClick={() => start(defaultSeconds)}>
            Rest
          </button>
        ) : (
          <button className="btn btn-sm btn-secondary" onClick={pause}>
            Pause
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rest-timer${isFinished ? ' finished' : ''}`}>
      <div className="timer-ring">
        <svg viewBox="0 0 120 120">
          <circle className="timer-bg" cx="60" cy="60" r="54" />
          <circle
            className="timer-progress"
            cx="60"
            cy="60"
            r="54"
            style={{
              strokeDasharray: `${2 * Math.PI * 54}`,
              strokeDashoffset: `${2 * Math.PI * 54 * (1 - progress / 100)}`,
            }}
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="timer-label">
            {isFinished ? 'Rest complete!' : isRunning ? 'Resting...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="timer-presets">
        {TIMER_PRESETS.map((preset) => (
          <button
            key={preset}
            className={`preset-btn${seconds === preset && !isRunning ? ' active' : ''}`}
            onClick={() => {
              setDuration(preset);
              reset(preset);
            }}
          >
            {preset < 60 ? `${preset}s` : `${preset / 60}m`}
          </button>
        ))}
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button className="btn btn-primary btn-block" onClick={() => start()}>
            {isFinished ? 'Start Again' : 'Start Timer'}
          </button>
        ) : (
          <button className="btn btn-secondary btn-block" onClick={pause}>
            Pause
          </button>
        )}
        <button className="btn btn-ghost btn-block" onClick={() => reset(defaultSeconds)}>
          Reset
        </button>
      </div>
    </div>
  );
}
