const ExerciseTemplate = require('../models/ExerciseTemplate');

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await ExerciseTemplate.find({})
      .sort({ usageCount: -1, name: 1 })
      .limit(50);
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const template = await ExerciseTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Exercise already exists' });
    }
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await ExerciseTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};
