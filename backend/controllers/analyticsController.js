const Workout = require('../models/Workout');

exports.getOverview = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({ date: { $gte: since } }).sort({
      date: 1,
    });

    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter((w) => w.completed).length;

    let totalVolume = 0;
    let totalSets = 0;
    const volumeByDay = [];
    const muscleGroupVolume = {};

    workouts.forEach((workout) => {
      let dayVolume = 0;
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.completed) {
            const vol = set.weight * set.reps;
            dayVolume += vol;
            totalVolume += vol;
            totalSets += 1;
            muscleGroupVolume[exercise.muscleGroup] =
              (muscleGroupVolume[exercise.muscleGroup] || 0) + vol;
          }
        });
      });
      volumeByDay.push({
        date: workout.date,
        volume: dayVolume,
        exercises: workout.exercises.length,
      });
    });

    const streak = calculateStreak(workouts);

    res.json({
      periodDays: days,
      totalWorkouts,
      completedWorkouts,
      totalVolume,
      totalSets,
      averageVolume: totalWorkouts ? Math.round(totalVolume / totalWorkouts) : 0,
      streak,
      volumeByDay,
      muscleGroupVolume,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPersonalRecords = async (req, res, next) => {
  try {
    const workouts = await Workout.find({}).sort({ date: -1 });
    const records = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!set.completed) return;

          const key = exercise.name.toLowerCase();
          const oneRepMax = estimateOneRepMax(set.weight, set.reps);

          if (!records[key]) {
            records[key] = {
              name: exercise.name,
              muscleGroup: exercise.muscleGroup,
              maxWeight: set.weight,
              maxReps: set.reps,
              maxVolume: set.weight * set.reps,
              estimatedOneRepMax: oneRepMax,
              date: workout.date,
            };
          } else {
            if (set.weight > records[key].maxWeight) {
              records[key].maxWeight = set.weight;
              records[key].maxReps = set.reps;
              records[key].date = workout.date;
            }
            if (set.weight * set.reps > records[key].maxVolume) {
              records[key].maxVolume = set.weight * set.reps;
            }
            if (oneRepMax > records[key].estimatedOneRepMax) {
              records[key].estimatedOneRepMax = oneRepMax;
            }
          }
        });
      });
    });

    const sorted = Object.values(records).sort(
      (a, b) => b.estimatedOneRepMax - a.estimatedOneRepMax
    );

    res.json(sorted);
  } catch (error) {
    next(error);
  }
};

exports.getExerciseHistory = async (req, res, next) => {
  try {
    const exerciseName = req.params.name;
    const workouts = await Workout.find({
      'exercises.name': new RegExp(`^${exerciseName}$`, 'i'),
    }).sort({ date: 1 });

    const history = [];

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name.toLowerCase() !== exerciseName.toLowerCase()) return;

        const completedSets = exercise.sets.filter((s) => s.completed);
        if (completedSets.length === 0) return;

        const maxWeight = Math.max(...completedSets.map((s) => s.weight));
        const totalVolume = completedSets.reduce(
          (sum, s) => sum + s.weight * s.reps,
          0
        );

        history.push({
          date: workout.date,
          maxWeight,
          totalVolume,
          sets: completedSets.length,
          avgReps: Math.round(
            completedSets.reduce((sum, s) => sum + s.reps, 0) /
              completedSets.length
          ),
        });
      });
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

function estimateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function calculateStreak(workouts) {
  if (workouts.length === 0) return 0;

  const workoutDates = new Set(
    workouts.map((w) => {
      const d = new Date(w.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

    if (workoutDates.has(key)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}
