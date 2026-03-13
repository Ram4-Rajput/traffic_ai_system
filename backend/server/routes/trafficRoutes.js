const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/update', auth, trafficController.updateTrafficData);
router.get('/congestion', trafficController.getCongestionData);
router.get('/heatmap', trafficController.getTrafficHeatmap);
router.get('/route', auth, trafficController.getOptimalRoute);
router.get('/history/:userId', auth, trafficController.getTrafficHistory);
router.get('/analytics', trafficController.getTrafficAnalytics);

module.exports = router;
