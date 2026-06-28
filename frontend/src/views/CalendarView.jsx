import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService, planService } from '../services/api';
import {
  getCalendarDays,
  formatDate,
  formatDateKey,
  isToday,
  sameDay,
  calcWorkoutVolume,
  calcCompletedSets,
  WEEKDAYS,
  getTodayWeekday,
} from '../models/constants';
import './CalendarView.css';

export default function CalendarView() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [workouts, setWorkouts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayWorkout, setDayWorkout] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getCalendarDays(year, month);

  useEffect(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    workoutService
      .getAll({ startDate: start.toISOString(), endDate: end.toISOString(), limit: 50 })
      .then(setWorkouts)
      .catch(() => {});
    planService.getAll().then(setPlans).catch(() => {});
  }, [year, month]);

  const workoutMap = workouts.reduce((map, w) => {
    map[formatDateKey(w.date)] = w;
    return map;
  }, {});

  const plansByWeekday = plans.reduce((map, p) => {
    if (!map[p.weekday]) map[p.weekday] = [];
    map[p.weekday].push(p);
    return map;
  }, {});

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const openDay = async (date) => {
    setSelectedDay(date);
    setLoadingDay(true);
    setDayWorkout(null);
    try {
      const w = await workoutService.getByDate(formatDateKey(date));
      setDayWorkout(w);
    } catch {
      setDayWorkout(null);
    } finally {
      setLoadingDay(false);
    }
  };

  const startPlanForDay = async (plan, date) => {
    try {
      setStarting(plan._id);
      await planService.start(plan._id, formatDateKey(date));
      setSelectedDay(null);
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setStarting(null);
    }
  };

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const dayPlans = selectedDay ? plansByWeekday[selectedDay.getDay()] || [] : [];

  return (
    <div className="page calendar-view">
      <header className="page-header hero-header">
        <h1>Calendar</h1>
        <p>Track workouts day by day</p>
      </header>

      <div className="calendar-nav">
        <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
          ‹
        </button>
        <h2 className="calendar-month">{monthLabel}</h2>
        <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d.value} className="calendar-weekday">
            {d.label}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="calendar-cell empty" />;

          const key = formatDateKey(date);
          const workout = workoutMap[key];
          const dayPlanList = plansByWeekday[date.getDay()] || [];
          const hasWorkout = !!workout;
          const hasPlans = dayPlanList.length > 0;

          return (
            <button
              key={key}
              className={`calendar-cell${isToday(date) ? ' today' : ''}${
                hasWorkout ? ' has-workout' : ''
              }${selectedDay && sameDay(selectedDay, date) ? ' selected' : ''}`}
              onClick={() => openDay(date)}
            >
              <span className="cell-day">{date.getDate()}</span>
              <div className="cell-dots">
                {hasWorkout && (
                  <span
                    className={`dot workout-dot${workout.completed ? ' completed' : ''}`}
                  />
                )}
                {hasPlans &&
                  dayPlanList.slice(0, 2).map((p) => (
                    <span
                      key={p._id}
                      className="dot plan-dot"
                      style={{ background: p.color }}
                    />
                  ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span><span className="dot workout-dot" /> Workout logged</span>
        <span><span className="dot plan-dot" style={{ background: '#6366f1' }} /> Plan scheduled</span>
      </div>

      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal day-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{formatDate(selectedDay)}</h2>
            {isToday(selectedDay) && <span className="badge badge-primary">Today</span>}

            {loadingDay ? (
              <div className="loading" style={{ minHeight: 100 }}>Loading...</div>
            ) : dayWorkout ? (
              <div className="day-workout-summary">
                <h3>{dayWorkout.title}</h3>
                <p>
                  {dayWorkout.exercises.length} exercises ·{' '}
                  {calcCompletedSets(dayWorkout)} sets ·{' '}
                  {calcWorkoutVolume(dayWorkout).toLocaleString()} kg
                </p>
                {dayWorkout.completed && (
                  <span className="badge badge-success">Completed</span>
                )}
                <button
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    setSelectedDay(null);
                    navigate('/');
                  }}
                >
                  View Workout
                </button>
              </div>
            ) : (
              <p className="no-workout-text">No workout logged for this day</p>
            )}

            {dayPlans.length > 0 && (
              <div className="day-plans-section">
                <h3>Plans for {WEEKDAYS.find((d) => d.value === selectedDay.getDay())?.full}</h3>
                {dayPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="day-plan-item"
                    style={{ borderLeftColor: plan.color }}
                  >
                    <div>
                      <strong>{plan.name}</strong>
                      <span>{plan.exercises.length} exercises</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => startPlanForDay(plan, selectedDay)}
                      disabled={starting === plan._id}
                    >
                      {starting === plan._id ? '...' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 16 }}
              onClick={() => setSelectedDay(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
