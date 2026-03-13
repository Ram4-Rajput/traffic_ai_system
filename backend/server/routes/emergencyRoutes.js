const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/alert', auth, emergencyController.triggerEmergencyAlert);
router.post('/confirm/:eventId', auth, emergencyController.confirmEmergency);
router.post('/false-alarm/:eventId', auth, emergencyController.markFalseAlarm);
router.get('/active', emergencyController.getActiveEmergencies);
router.get('/nearby', auth, emergencyController.getNearbyEmergencies);
router.get('/stats', emergencyController.getEmergencyStats);

module.exports = router;
