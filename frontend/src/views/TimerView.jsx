import RestTimer from '../components/RestTimer';
import { TIMER_PRESETS } from '../models/constants';
import './TimerView.css';

export default function TimerView() {
  return (
    <div className="page timer-view">
      <header className="page-header">
        <h1>Rest Timer</h1>
        <p>Take a break between sets</p>
      </header>

      <div className="card">
        <RestTimer defaultSeconds={90} />
      </div>

      <div className="card timer-tips">
        <h3>Tips</h3>
        <ul>
          <li>Strength training: 2–3 min rest</li>
          <li>Hypertrophy: 60–90 sec rest</li>
          <li>Endurance: 30–45 sec rest</li>
          <li>Timer auto-starts when you complete a set in workout</li>
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Quick Presets</h3>
        <div className="preset-grid">
          {TIMER_PRESETS.map((preset) => (
            <div key={preset} className="preset-card">
              <span className="preset-value">
                {preset < 60 ? `${preset}s` : `${preset / 60}m`}
              </span>
              <span className="preset-desc">
                {preset <= 45
                  ? 'Endurance'
                  : preset <= 90
                  ? 'Hypertrophy'
                  : 'Strength'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
