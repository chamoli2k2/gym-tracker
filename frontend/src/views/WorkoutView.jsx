import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../controllers/useWorkoutController';
import { planService } from '../services/api';
import ExerciseCard from '../components/ExerciseCard';
import AddExerciseModal from '../components/AddExerciseModal';
import RestTimer from '../components/RestTimer';
import {
  formatDate,
  isToday,
  getTodayWeekday,
  getWeekdayLabel,
} from '../models/constants';
import './WorkoutView.css';

export default function WorkoutView() {
  const { workout, loading, saving, error, saveWorkout, stats, reload } = useWorkout();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeRestSeconds, setActiveRestSeconds] = useState(90);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [todayPlans, setTodayPlans] = useState([]);
  const [startingPlan, setStartingPlan] = useState(null);

  useEffect(() => {
    planService
      .getByWeekday(getTodayWeekday())
      .then(setTodayPlans)
      .catch(() => {});
  }, [workout?._id]);

  const updateExercise = (index, updatedExercise) => {
    const exercises = workout.exercises.map((ex, i) =>
      i === index ? updatedExercise : ex
    );
    saveWorkout({ ...workout, exercises });
  };

  const removeExercise = (index) => {
    const exercises = workout.exercises.filter((_, i) => i !== index);
    saveWorkout({ ...workout, exercises });
  };

  const addExercise = (exercise) => {
    saveWorkout({
      ...workout,
      exercises: [...workout.exercises, exercise],
    });
  };

  const handleSetComplete = (restSeconds) => {
    setActiveRestSeconds(restSeconds);
    setShowRestTimer(true);
  };

  const markComplete = () => {
    saveWorkout({ ...workout, completed: !workout.completed });
  };

  const startFromPlan = async (plan) => {
    const msg =
      workout.exercises.length > 0
        ? `Replace current workout with "${plan.name}"?`
        : `Load "${plan.name}" (${plan.exercises.length} exercises)?`;
    if (!confirm(msg)) return;

    try {
      setStartingPlan(plan._id);
      await planService.start(plan._id);
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setStartingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="page">
        <div className="error-banner">{error || 'Could not load workout'}</div>
        <button className="btn btn-primary btn-block" onClick={reload} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    );
  }

  const progress =
    stats.totalExercises > 0
      ? Math.round(
          (stats.completedSets /
            workout.exercises.reduce((t, ex) => t + ex.sets.length, 0)) *
            100
        )
      : 0;

  return (
    <div className="page workout-view">
      {saving && <div className="saving-indicator">Saving...</div>}
      {error && <div className="error-banner">{error}</div>}

      <header className="workout-hero">
        <div className="hero-top">
          <div>
            <span className="hero-date">
              {isToday(workout.date)
                ? `${getWeekdayLabel(getTodayWeekday())} · Today`
                : formatDate(workout.date)}
            </span>
            <h1>{workout.title || "Today's Workout"}</h1>
          </div>
          <button
            className={`complete-btn${workout.completed ? ' done' : ''}`}
            onClick={markComplete}
          >
            {workout.completed ? '✓ Done' : 'Finish'}
          </button>
        </div>

        {stats.totalExercises > 0 && (
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}% sets complete</span>
          </div>
        )}
      </header>

      <div className="stats-grid stats-grid-enhanced">
        <div className="stat-card stat-card-accent">
          <span className="stat-icon">⚡</span>
          <div className="stat-value">{stats.volume.toLocaleString()}</div>
          <div className="stat-label">Volume kg</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✓</span>
          <div className="stat-value">{stats.completedSets}</div>
          <div className="stat-label">Sets</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏋️</span>
          <div className="stat-value">{stats.totalExercises}</div>
          <div className="stat-label">Exercises</div>
        </div>
      </div>

      {todayPlans.length > 0 && workout.exercises.length === 0 && (
        <div className="quick-plans card">
          <div className="quick-plans-header">
            <h3>Today's Plans</h3>
            <Link to="/plans" className="link-muted">
              Manage →
            </Link>
          </div>
          <div className="quick-plans-list">
            {todayPlans.map((plan) => (
              <button
                key={plan._id}
                className="quick-plan-btn"
                style={{ '--plan-color': plan.color }}
                onClick={() => startFromPlan(plan)}
                disabled={startingPlan === plan._id}
              >
                <span className="quick-plan-icon">📁</span>
                <span className="quick-plan-name">{plan.name}</span>
                <span className="quick-plan-meta">{plan.exercises.length} ex</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showRestTimer && (
        <div className="card rest-timer-card">
          <div className="rest-timer-header">
            <span>Rest Timer</span>
            <button className="btn-ghost btn-sm" onClick={() => setShowRestTimer(false)}>
              Hide
            </button>
          </div>
          <RestTimer defaultSeconds={activeRestSeconds} />
        </div>
      )}

      {workout.exercises.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🏋️</div>
          <p>No exercises yet</p>
          <span className="empty-hint">
            Tap + below to search and add an exercise
          </span>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowAddModal(true)}
          >
            + Add Exercise
          </button>
        </div>
      ) : (
        workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise._id || index}
            exercise={exercise}
            exerciseIndex={index}
            onUpdate={updateExercise}
            onRemove={removeExercise}
            onSetComplete={handleSetComplete}
          />
        ))
      )}

      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add exercise">
        +
      </button>

      {showAddModal && (
        <AddExerciseModal onAdd={addExercise} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
