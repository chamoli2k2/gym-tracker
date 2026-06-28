const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

router.get('/', workoutController.getWorkouts);
router.get('/today', workoutController.getOrCreateTodayWorkout);
router.get('/date/:date', workoutController.getWorkoutByDate);
router.get('/:id', workoutController.getWorkoutById);
router.post('/', workoutController.createWorkout);
router.post('/:id/duplicate', workoutController.duplicateWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;
