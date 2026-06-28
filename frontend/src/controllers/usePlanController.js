import { useState, useEffect, useCallback } from 'react';
import { planService } from '../services/api';

export function usePlans(selectedWeekday) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getByWeekday(selectedWeekday);
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWeekday]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const savePlan = async (planData, planId) => {
    const saved = planId
      ? await planService.update(planId, planData)
      : await planService.create(planData);
    await loadPlans();
    return saved;
  };

  const removePlan = async (planId) => {
    await planService.delete(planId);
    await loadPlans();
  };

  const startPlan = async (planId, date, mode = 'replace') => {
    return planService.start(planId, date, mode);
  };

  return { plans, loading, error, savePlan, removePlan, startPlan, reload: loadPlans };
}

export function useAllPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planService.getAll().then(setPlans).finally(() => setLoading(false));
  }, []);

  return { plans, loading };
}
