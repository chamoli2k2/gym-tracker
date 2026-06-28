const mongoose = require('mongoose');

const exerciseTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
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
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: Number, default: 10 },
    defaultWeight: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExerciseTemplate', exerciseTemplateSchema);
