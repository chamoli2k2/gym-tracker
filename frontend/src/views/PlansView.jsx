import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../controllers/usePlanController';
import { WEEKDAYS, getTodayWeekday } from '../models/constants';
import PlanEditorModal from '../components/PlanEditorModal';
import './PlansView.css';

export default function PlansView() {
  const [selectedDay, setSelectedDay] = useState(getTodayWeekday());
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();

  const { plans, loading, error, savePlan, removePlan, startPlan } = usePlans(selectedDay);

  const handleSave = async (data) => {
    await savePlan(data, editingPlan?._id);
    setEditingPlan(null);
  };

  const handleStart = async (plan) => {
    if (
      !confirm(
        `Start "${plan.name}" workout for today? This will load ${plan.exercises.length} exercises.`
      )
    ) {
      return;
    }
    try {
      setStarting(plan._id);
      await startPlan(plan._id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setStarting(null);
    }
  };

  const handleDelete = async (plan) => {
    if (!confirm(`Delete "${plan.name}" plan?`)) return;
    await removePlan(plan._id);
  };

  const openNew = () => {
    setEditingPlan(null);
    setShowEditor(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setShowEditor(true);
  };

  return (
    <div className="page plans-view">
      <header className="page-header hero-header">
        <h1>Weekly Plans</h1>
        <p>Create workout folders for each day of the week</p>
      </header>

      <div className="weekday-tabs">
        {WEEKDAYS.map((day) => (
          <button
            key={day.value}
            className={`weekday-tab${selectedDay === day.value ? ' active' : ''}${
              day.value === getTodayWeekday() ? ' today' : ''
            }`}
            onClick={() => setSelectedDay(day.value)}
          >
            <span className="tab-label">{day.label}</span>
          </button>
        ))}
      </div>

      <div className="day-banner">
        <span className="day-banner-text">
          {WEEKDAYS.find((d) => d.value === selectedDay)?.full}
        </span>
        <span className="day-banner-count">{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>No plans for {WEEKDAYS.find((d) => d.value === selectedDay)?.full} yet.</p>
          <button className="btn btn-primary" onClick={openNew} style={{ marginTop: 16 }}>
            Create Plan
          </button>
        </div>
      ) : (
        <div className="plan-list">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="plan-folder"
              style={{ '--plan-color': plan.color }}
            >
              <button
                className="plan-folder-header"
                onClick={() =>
                  setExpandedId(expandedId === plan._id ? null : plan._id)
                }
              >
                <div className="plan-folder-icon">📁</div>
                <div className="plan-folder-info">
                  <h3>{plan.name}</h3>
                  <span>{plan.exercises.length} exercises</span>
                </div>
                <span className="expand-arrow">
                  {expandedId === plan._id ? '▲' : '▼'}
                </span>
              </button>

              {expandedId === plan._id && (
                <div className="plan-folder-body">
                  <ul className="plan-exercise-list">
                    {plan.exercises.map((ex, i) => (
                      <li key={i}>
                        <strong>{ex.name}</strong>
                        <span>
                          {ex.sets.length} sets · {ex.sets[0]?.weight || 0} kg ×{' '}
                          {ex.sets[0]?.reps || 0} reps
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="plan-folder-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStart(plan)}
                      disabled={starting === plan._id}
                    >
                      {starting === plan._id ? '...' : '▶ Start'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(plan)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(plan)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={openNew} aria-label="Add plan">
        +
      </button>

      {showEditor && (
        <PlanEditorModal
          plan={editingPlan}
          weekday={selectedDay}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
}
