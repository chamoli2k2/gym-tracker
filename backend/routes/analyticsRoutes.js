const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/records', analyticsController.getPersonalRecords);
router.get('/exercise/:name', analyticsController.getExerciseHistory);

module.exports = router;
