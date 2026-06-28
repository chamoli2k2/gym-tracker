const WorkoutPlan = require('../models/WorkoutPlan');
const Workout = require('../models/Workout');
const { getExerciseImage } = require('../utils/exerciseImages');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const planExercisesToWorkout = (planExercises) =>
  planExercises.map((ex) => ({
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    notes: '',
    imageUrl: ex.imageUrl || getExerciseImage(ex.name, ex.muscleGroup),
    sets: ex.sets.map((s) => ({
      weight: s.weight,
      reps: s.reps,
      completed: false,
      restSeconds: s.restSeconds || 90,
    })),
  }));

exports.getPlans = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.weekday !== undefined) {
      filter.weekday = Number(req.query.weekday);
    }

    const plans = await WorkoutPlan.find(filter).sort({ weekday: 1, sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

exports.getPlansByWeekday = async (req, res, next) => {
  try {
    const weekday = Number(req.params.weekday);
    const plans = await WorkoutPlan.find({ weekday }).sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const { weekday, name, color, exercises, sortOrder } = req.body;
    const plan = await WorkoutPlan.create({
      weekday,
      name,
      color: color || '#6366f1',
      exercises: exercises || [],
      sortOrder: sortOrder ?? 0,
    });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { weekday, name, color, exercises, sortOrder } = req.body;
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (weekday !== undefined) plan.weekday = weekday;
    if (name !== undefined) plan.name = name;
    if (color !== undefined) plan.color = color;
    if (exercises !== undefined) plan.exercises = exercises;
    if (sortOrder !== undefined) plan.sortOrder = sortOrder;

    await plan.save();
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};

exports.startPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const targetDate = req.body.date
      ? startOfDay(req.body.date)
      : startOfDay(new Date());

    const mode = req.body.mode || 'replace';

    let workout = await Workout.findOne({
      date: { $gte: targetDate, $lte: endOfDay(targetDate) },
    });

    const converted = planExercisesToWorkout(plan.exercises);

    if (!workout) {
      workout = await Workout.create({
        date: targetDate,
        title: plan.name,
        exercises: converted,
      });
      return res.json(workout);
    }

    if (mode === 'append') {
      workout.exercises = [...workout.exercises, ...converted];
    } else {
      workout.exercises = converted;
      workout.title = plan.name;
    }

    await workout.save();
    res.json(workout);
  } catch (error) {
    next(error);
  }
};
