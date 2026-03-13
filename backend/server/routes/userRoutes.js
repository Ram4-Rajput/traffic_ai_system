const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOTP);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/location', auth, userController.updateLocation);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/stats', auth, userController.getUserStats);

module.exports = router;
