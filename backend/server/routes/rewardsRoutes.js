const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');
const auth = require('../middleware/auth');

// Protected routes
router.get('/available', rewardsController.getAvailableRewards);
router.get('/my-coupons', auth, rewardsController.getMyCoupons);
router.post('/redeem', auth, rewardsController.redeemReward);
router.get('/partners', rewardsController.getPartners);
router.get('/leaderboard', rewardsController.getLeaderboard);
router.post('/coupon/validate', auth, rewardsController.validateCoupon);

module.exports = router;
