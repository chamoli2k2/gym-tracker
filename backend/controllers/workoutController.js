const Workout = require('../models/Workout');
const ExerciseTemplate = require('../models/ExerciseTemplate');

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

exports.getWorkouts = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startOfDay(startDate);
      if (endDate) filter.date.$lte = endOfDay(endDate);
    }

    const workouts = await Workout.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(workouts);
  } catch (error) {
    next(error);
  }
};

exports.getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(workout);
  } catch (error) {
    next(error);
  }
};

exports.getWorkoutByDate = async (req, res, next) => {
  try {
    const date = startOfDay(req.params.date);
    const workout = await Workout.findOne({
      date: { $gte: date, $lte: endOfDay(date) },
    });

    if (!workout) {
      return res.status(404).json({ message: 'No workout for this date' });
    }
    res.json(workout);
  } catch (error) {
    next(error);
  }
};

exports.getOrCreateTodayWorkout = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());
    let workout = await Workout.findOne({
      date: { $gte: today, $lte: endOfDay(today) },
    });

    if (!workout) {
      workout = await Workout.create({
        date: today,
        title: 'Today\'s Workout',
        exercises: [],
      });
    }

    res.json(workout);
  } catch (error) {
    next(error);
  }
};

exports.createWorkout = async (req, res, next) => {
  try {
    const { date, title, exercises, notes } = req.body;
    const workout = await Workout.create({
      date: date ? startOfDay(date) : startOfDay(new Date()),
      title: title || 'Workout',
      exercises: exercises || [],
      notes: notes || '',
    });
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const { title, exercises, notes, durationMinutes, completed } = req.body;
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (title !== undefined) workout.title = title;
    if (exercises !== undefined) workout.exercises = exercises;
    if (notes !== undefined) workout.notes = notes;
    if (durationMinutes !== undefined) workout.durationMinutes = durationMinutes;
    if (completed !== undefined) workout.completed = completed;

    await workout.save();

    for (const exercise of workout.exercises) {
      await ExerciseTemplate.findOneAndUpdate(
        { name: exercise.name },
        {
          $set: {
            muscleGroup: exercise.muscleGroup,
            imageUrl: exercise.imageUrl || '',
          },
          $inc: { usageCount: 1 },
        },
        { upsert: true, new: true }
      );
    }

    res.json(workout);
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
};

exports.duplicateWorkout = async (req, res, next) => {
  try {
    const source = await Workout.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const targetDate = req.body.date
      ? startOfDay(req.body.date)
      : startOfDay(new Date());

    const existing = await Workout.findOne({
      date: { $gte: targetDate, $lte: endOfDay(targetDate) },
    });

    if (existing) {
      return res.status(400).json({
        message: 'A workout already exists for this date',
        workoutId: existing._id,
      });
    }

    const duplicated = await Workout.create({
      date: targetDate,
      title: source.title,
      notes: source.notes,
      exercises: source.exercises.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        notes: ex.notes,
        imageUrl: ex.imageUrl || '',
        sets: ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: false,
          restSeconds: s.restSeconds,
        })),
      })),
    });

    res.status(201).json(duplicated);
  } catch (error) {
    next(error);
  }
};
