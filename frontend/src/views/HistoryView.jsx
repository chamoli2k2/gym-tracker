import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkoutHistory } from '../controllers/useWorkoutController';
import { workoutService } from '../services/api';
import {
  formatDate,
  formatDateKey,
  calcWorkoutVolume,
  calcCompletedSets,
  isToday,
} from '../models/constants';
import './HistoryView.css';

export default function HistoryView() {
  const { workouts, loading, error } = useWorkoutHistory(90);
  const [duplicating, setDuplicating] = useState(null);

  const handleDuplicate = async (workoutId) => {
    try {
      setDuplicating(workoutId);
      await workoutService.duplicate(workoutId, formatDateKey(new Date()));
      alert('Workout copied to today!');
    } catch (err) {
      alert(err.message);
    } finally {
      setDuplicating(null);
    }
  };

  const groupedByMonth = workouts.reduce((groups, workout) => {
    const d = new Date(workout.date);
    const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(workout);
    return groups;
  }, {});

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="page history-view">
      <header className="page-header">
        <h1>History</h1>
        <p>Your past workouts by day</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {workouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No workouts recorded yet. Start logging today!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Start Workout
          </Link>
        </div>
      ) : (
        Object.entries(groupedByMonth).map(([month, monthWorkouts]) => (
          <div key={month} className="month-group">
            <h2 className="month-title">{month}</h2>
            {monthWorkouts.map((workout) => {
              const volume = calcWorkoutVolume(workout);
              const sets = calcCompletedSets(workout);

              return (
                <div key={workout._id} className="history-card">
                  <div className="history-card-main">
                    <div className="history-date">
                      {isToday(workout.date) ? 'Today' : formatDate(workout.date)}
                      {workout.completed && (
                        <span className="badge badge-success">Completed</span>
                      )}
                    </div>
                    <div className="history-meta">
                      {workout.exercises.length} exercises · {sets} sets ·{' '}
                      {volume.toLocaleString()} kg
                    </div>
                    <div className="history-exercises">
                      {workout.exercises.slice(0, 3).map((ex, i) => (
                        <span key={i} className="exercise-tag">
                          {ex.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="exercise-tag">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="history-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDuplicate(workout._id)}
                      disabled={duplicating === workout._id}
                    >
                      {duplicating === workout._id ? '...' : 'Copy to Today'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
