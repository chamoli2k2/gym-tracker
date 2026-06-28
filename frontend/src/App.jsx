import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import WorkoutView from './views/WorkoutView';
import PlansView from './views/PlansView';
import CalendarView from './views/CalendarView';
import HistoryView from './views/HistoryView';
import TimerView from './views/TimerView';
import AnalyticsView from './views/AnalyticsView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<WorkoutView />} />
          <Route path="/plans" element={<PlansView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/timer" element={<TimerView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
