import { useState, useEffect, useCallback, useRef } from 'react';
import { workoutService, analyticsService } from '../services/api';
import { calcWorkoutVolume, calcCompletedSets } from '../models/constants';

export function useWorkout(workoutId) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const saveTimeout = useRef(null);

  const loadWorkout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = workoutId
        ? await workoutService.getById(workoutId)
        : await workoutService.getToday();
      setWorkout(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const saveWorkout = useCallback(
    async (updatedWorkout) => {
      setWorkout(updatedWorkout);
      setSaving(true);

      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        try {
          const saved = await workoutService.update(updatedWorkout._id, {
            title: updatedWorkout.title,
            exercises: updatedWorkout.exercises,
            notes: updatedWorkout.notes,
            durationMinutes: updatedWorkout.durationMinutes,
            completed: updatedWorkout.completed,
          });
          setWorkout(saved);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setSaving(false);
        }
      }, 600);
    },
    []
  );

  const stats = workout
    ? {
        volume: calcWorkoutVolume(workout),
        completedSets: calcCompletedSets(workout),
        totalExercises: workout.exercises.length,
      }
    : { volume: 0, completedSets: 0, totalExercises: 0 };

  return { workout, loading, saving, error, saveWorkout, reload: loadWorkout, stats };
}

export function useWorkoutHistory(days = 60) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const start = new Date();
        start.setDate(start.getDate() - days);
        const data = await workoutService.getAll({
          startDate: start.toISOString(),
          limit: 100,
        });
        setWorkouts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  return { workouts, loading, error };
}

export function useAnalytics(days = 30) {
  const [overview, setOverview] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [overviewData, recordsData] = await Promise.all([
          analyticsService.getOverview(days),
          analyticsService.getRecords(),
        ]);
        setOverview(overviewData);
        setRecords(recordsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  return { overview, records, loading, error };
}
