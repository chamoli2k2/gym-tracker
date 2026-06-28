import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAnalytics } from '../controllers/useWorkoutController';
import { getMuscleLabel } from '../models/constants';
import './AnalyticsView.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function AnalyticsView() {
  const [days, setDays] = useState(30);
  const { overview, records, loading, error } = useAnalytics(days);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!overview) return null;

  const volumeData = overview.volumeByDay.slice(-14).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: d.volume,
  }));

  const muscleData = Object.entries(overview.muscleGroupVolume).map(([key, value]) => ({
    name: getMuscleLabel(key),
    value: Math.round(value),
  }));

  return (
    <div className="page analytics-view">
      <header className="page-header">
        <h1>Analytics</h1>
        <p>Track your progress over time</p>
      </header>

      <div className="period-selector">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            className={`period-btn${days === d ? ' active' : ''}`}
            onClick={() => setDays(d)}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{overview.totalWorkouts}</div>
          <div className="stat-label">Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {(overview.totalVolume / 1000).toFixed(1)}k
          </div>
          <div className="stat-label">Total Vol</div>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Volume (last 14 sessions)</h3>
        {volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData}>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} width={40} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">Log workouts to see volume trends</p>
        )}
      </div>

      {muscleData.length > 0 && (
        <div className="card chart-card">
          <h3>Muscle Group Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={muscleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {muscleData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3>Personal Records</h3>
        {records.length === 0 ? (
          <p className="no-data">Complete sets to track PRs</p>
        ) : (
          <div className="records-list">
            {records.slice(0, 10).map((record, i) => (
              <div key={i} className="record-item">
                <div>
                  <div className="record-name">{record.name}</div>
                  <div className="record-meta">
                    {getMuscleLabel(record.muscleGroup)} · Est. 1RM:{' '}
                    {record.estimatedOneRepMax} kg
                  </div>
                </div>
                <div className="record-weight">
                  {record.maxWeight} kg × {record.maxReps}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{overview.totalSets}</div>
          <div className="stat-label">Total Sets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview.averageVolume.toLocaleString()}</div>
          <div className="stat-label">Avg Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overview.completedWorkouts}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>
    </div>
  );
}
