const mongoose = require('mongoose');

const planSetSchema = new mongoose.Schema(
  {
    weight: { type: Number, default: 0, min: 0 },
    reps: { type: Number, default: 10, min: 1 },
    restSeconds: { type: Number, default: 90 },
  },
  { _id: true }
);

const planExerciseSchema = new mongoose.Schema(
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
    sets: [planSetSchema],
    imageUrl: { type: String, default: '' },
  },
  { _id: true }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    weekday: { type: Number, required: true, min: 0, max: 6 },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    exercises: [planExerciseSchema],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workoutPlanSchema.index({ weekday: 1, sortOrder: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
