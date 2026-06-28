const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.get('/', planController.getPlans);
router.get('/weekday/:weekday', planController.getPlansByWeekday);
router.get('/:id', planController.getPlanById);
router.post('/', planController.createPlan);
router.post('/:id/start', planController.startPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
