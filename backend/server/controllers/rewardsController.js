const Partner = require('../models/Partner');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Get available rewards
const getAvailableRewards = async (req, res) => {
  try {
    const { max_points, business_type, limit = 20 } = req.query;

    let maxPoints = null;
    if (max_points) {
      maxPoints = parseInt(max_points);
    }

    const availableRewards = await Partner.findAvailableCoupons(maxPoints);

    // Filter by business type if specified
    let filteredRewards = availableRewards;
    if (business_type) {
      filteredRewards = availableRewards.filter(
        reward => reward.business_type === business_type
      );
    }

    // Apply limit
    const limitedRewards = filteredRewards.slice(0, parseInt(limit));

    res.json({
      rewards: limitedRewards.map(reward => ({
        partner_id: reward.partner_id,
        partner_name: reward.partner_name,
        business_type: reward.business_type,
        logo_url: reward.logo_url,
        rating: reward.rating,
        coupon: {
          coupon_id: reward.coupon.coupon_id,
          title: reward.coupon.title,
          description: reward.coupon.description,
          points_required: reward.coupon.points_required,
          discount_type: reward.coupon.discount_type,
          discount_value: reward.coupon.discount_value,
          min_order_amount: reward.coupon.min_order_amount,
          max_discount_amount: reward.coupon.max_discount_amount,
          validity_period: reward.coupon.validity_period,
          expires_at: reward.coupon.expires_at
        }
      }))
    });

  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({
      error: 'Failed to get available rewards',
      message: error.message
    });
  }
};

// Get user's coupons
const getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, page = 1 } = req.query;

    let query = { user_id: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const coupons = await Coupon.find(query)
      .populate('partner_id', 'partner_name business_type logo_url')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons: coupons.map(coupon => ({
        coupon_id: coupon.coupon_id,
        coupon_code: coupon.coupon_code,
        title: coupon.title,
        description: coupon.description,
        points_used: coupon.points_used,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        max_discount_amount: coupon.max_discount_amount,
        status: coupon.status,
        issued_at: coupon.issued_at,
        expiry_date: coupon.expiry_date,
        redeemed_at: coupon.redeemed_at,
        partner: {
          partner_id: coupon.partner_id.partner_id,
          partner_name: coupon.partner_id.partner_name,
          business_type: coupon.partner_id.business_type,
          logo_url: coupon.partner_id.logo_url
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my coupons error:', error);
    res.status(500).json({
      error: 'Failed to get user coupons',
      message: error.message
    });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { partner_id, coupon_id } = req.body;

    if (!partner_id || !coupon_id) {
      return res.status(400).json({
        error: 'Missing required fields: partner_id, coupon_id'
      });
    }

    // Get user info
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get partner info
    const partner = await Partner.findOne({ partner_id });
    if (!partner) {
      return res.status(404).json({
        error: 'Partner not found'
      });
    }

    // Find the specific coupon
    const couponData = partner.coupons.id(coupon_id);
    if (!couponData) {
      return res.status(404).json({
        error: 'Coupon not found'
      });
    }

    // Check if coupon is active and available
    if (!couponData.is_active) {
      return res.status(400).json({
        error: 'Coupon is not active'
      });
    }

    if (couponData.expires_at && couponData.expires_at < new Date()) {
      return res.status(400).json({
        error: 'Coupon has expired'
      });
    }

    if (couponData.current_redemptions >= couponData.redemption_limit) {
      return res.status(400).json({
        error: 'Coupon redemption limit reached'
      });
    }

    // Check if user has enough points
    if (user.civic_points < couponData.points_required) {
      return res.status(400).json({
        error: 'Insufficient civic points',
        required: couponData.points_required,
        available: user.civic_points
      });
    }

    // Generate unique coupon code
    const coupon_code = `SR-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create user coupon
    const userCoupon = new Coupon({
      coupon_id: `UCP-${uuidv4().split('-')[0].toUpperCase()}`,
      user_id: userId,
      partner_id: partner_id,
      coupon_code: coupon_code,
      title: couponData.title,
      description: couponData.description,
      points_used: couponData.points_required,
      discount_type: couponData.discount_type,
      discount_value: couponData.discount_value,
      min_order_amount: couponData.min_order_amount,
      max_discount_amount: couponData.max_discount_amount,
      applicable_items: couponData.applicable_items,
      terms_conditions: couponData.terms_conditions,
      expiry_date: new Date(Date.now() + couponData.validity_period * 24 * 60 * 60 * 1000),
      partner_name: partner.partner_name,
      partner_logo: partner.logo_url
    });

    await userCoupon.save();

    // Deduct points from user
    await user.addCivicPoints(-couponData.points_required, `Redeemed coupon: ${couponData.title}`);

    // Increment coupon redemption count
    await partner.redeemCoupon(coupon_id);

    res.status(201).json({
      message: 'Reward redeemed successfully',
      coupon: {
        coupon_id: userCoupon.coupon_id,
        coupon_code: userCoupon.coupon_code,
        title: userCoupon.title,
        description: userCoupon.description,
        points_used: userCoupon.points_used,
        discount_type: userCoupon.discount_type,
        discount_value: userCoupon.discount_value,
        min_order_amount: userCoupon.min_order_amount,
        max_discount_amount: userCoupon.max_discount_amount,
        expiry_date: userCoupon.expiry_date,
        partner_name: userCoupon.partner_name,
        partner_logo: userCoupon.partner_logo
      },
      remaining_points: user.civic_points
    });

  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      error: 'Failed to redeem reward',
      message: error.message
    });
  }
};

// Get partners
const getPartners = async (req, res) => {
  try {
    const { business_type, limit = 20 } = req.query;

    let query = {
      is_active: true,
      verification_status: 'verified'
    };

    if (business_type) {
      query.business_type = business_type;
    }

    const partners = await Partner.find(query)
      .sort({ rating: -1 })
      .limit(parseInt(limit));

    res.json({
      partners: partners.map(partner => ({
        partner_id: partner.partner_id,
        partner_name: partner.partner_name,
        business_type: partner.business_type,
        logo_url: partner.logo_url,
        description: partner.description,
        rating: partner.rating,
        total_coupons_redeemed: partner.total_coupons_redeemed,
        active_coupons: partner.getActiveCoupons().length
      }))
    });

  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      error: 'Failed to get partners',
      message: error.message
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const leaderboard = await User.getLeaderboard(parseInt(limit));

    res.json({
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        user_id: user.user_id,
        name: user.name,
        civic_points: user.civic_points,
        badges: user.badges
      }))
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      message: error.message
    });
  }
};

// Validate coupon (for partners to verify)
const validateCoupon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { coupon_code, location } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        error: 'Coupon code is required'
      });
    }

    // Find the coupon
    const coupon = await Coupon.validateCoupon(coupon_code, userId);
    if (!coupon) {
      return res.status(404).json({
        error: 'Invalid or inactive coupon'
      });
    }

    // Check if expired
    if (coupon.isExpired()) {
      return res.status(400).json({
        error: 'Coupon has expired'
      });
    }

    res.json({
      valid: true,
      coupon: {
        coupon_id: coupon.coupon_id,
        title: coupon.title,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        max_discount_amount: coupon.max_discount_amount,
        applicable_items: coupon.applicable_items,
        terms_conditions: coupon.terms_conditions,
        partner_name: coupon.partner_name
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      error: 'Failed to validate coupon',
      message: error.message
    });
  }
};

module.exports = {
  getAvailableRewards,
  getMyCoupons,
  redeemReward,
  getPartners,
  getLeaderboard,
  validateCoupon
};
