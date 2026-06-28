const mongoose = require('mongoose');

const setSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true, min: 0 },
    reps: { type: Number, required: true, min: 1 },
    completed: { type: Boolean, default: false },
    restSeconds: { type: Number, default: 90 },
  },
  { _id: true }
);

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    muscleGroup: {
      type: String,
      enum: [
        'chest',
        'back',
        'shoulders',
        'biceps',
        'triceps',
        'legs',
        'core',
        'cardio',
        'other',
      ],
      default: 'other',
    },
    sets: [setSchema],
    notes: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    title: { type: String, default: 'Workout', trim: true },
    exercises: [exerciseSchema],
    durationMinutes: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workoutSchema.index({ date: -1 });

workoutSchema.virtual('totalVolume').get(function () {
  return this.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((setTotal, set) => {
        if (!set.completed) return setTotal;
        return setTotal + set.weight * set.reps;
      }, 0)
    );
  }, 0);
});

workoutSchema.virtual('totalSets').get(function () {
  return this.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((s) => s.completed).length,
    0
  );
});

workoutSchema.set('toJSON', { virtuals: true });
workoutSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Workout', workoutSchema);
