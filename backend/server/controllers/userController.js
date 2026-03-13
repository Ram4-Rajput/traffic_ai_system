const User = require('../models/User');
const TrafficData = require('../models/TrafficData');
const RoadIssue = require('../models/RoadIssue');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate user ID
const generateUserId = async () => {
  const lastUser = await User.findOne().sort({ created_at: -1 });
  let nextId = 1;
  
  if (lastUser && lastUser.user_id) {
    const lastNumber = parseInt(lastUser.user_id.split('-')[1]);
    nextId = lastNumber + 1;
  }
  
  return `USR-${nextId.toString().padStart(6, '0')}`;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      vehicle_type,
      emergency_contact_primary,
      emergency_contact_secondary,
      device_info
    } = req.body;

    // Validation
    if (!name || !phone || !vehicle_type || !emergency_contact_primary) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'phone', 'vehicle_type', 'emergency_contact_primary']
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this phone number already exists'
      });
    }

    // Generate unique user ID
    const user_id = await generateUserId();

    // Create new user
    const user = new User({
      user_id,
      name,
      phone,
      email: email || '',
      vehicle_type,
      emergency_contact_primary,
      emergency_contact_secondary: emergency_contact_secondary || '',
      device_info: device_info || {}
    });

    await user.save();

    // Generate token
    const token = generateToken(user_id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vehicle_type: user.vehicle_type,
        civic_points: user.civic_points,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone number and OTP are required'
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // In a real app, validate OTP here
    // For demo, we'll accept any 6-digit OTP
    if (otp.length !== 6) {
      return res.status(400).json({
        error: 'Invalid OTP format'
      });
    }

    // Update last active
    user.last_active = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.user_id);

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vehicle_type: user.vehicle_type,
        civic_points: user.civic_points,
        badges: user.badges,
        last_active: user.last_active
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};

// Verify OTP (for registration)
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, userData } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone number and OTP are required'
      });
    }

    // In a real app, verify OTP with SMS service
    // For demo, we'll accept any 6-digit OTP
    if (otp.length !== 6) {
      return res.status(400).json({
        error: 'Invalid OTP'
      });
    }

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      error: 'OTP verification failed',
      message: error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vehicle_type: user.vehicle_type,
        emergency_contact_primary: user.emergency_contact_primary,
        emergency_contact_secondary: user.emergency_contact_secondary,
        civic_points: user.civic_points,
        badges: user.badges,
        preferences: user.preferences,
        last_location: user.last_location,
        created_at: user.created_at,
        last_active: user.last_active
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.user_id;
    delete updates.civic_points;
    delete updates.created_at;

    const user = await User.findOneAndUpdate(
      { user_id: userId },
      { ...updates, last_active: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vehicle_type: user.vehicle_type,
        emergency_contact_primary: user.emergency_contact_primary,
        emergency_contact_secondary: user.emergency_contact_secondary,
        preferences: user.preferences,
        last_active: user.last_active
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

// Update user location
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await user.updateLastLocation(latitude, longitude);

    res.json({
      message: 'Location updated successfully',
      location: user.last_location
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Failed to update location',
      message: error.message
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const leaderboard = await User.getLeaderboard(limit);

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

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user info
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's reported issues
    const reportedIssues = await RoadIssue.findByUser(userId);
    const verifiedIssues = reportedIssues.filter(issue => issue.verified);
    
    // Get user's redeemed coupons
    const redeemedCoupons = await Coupon.findByUser(userId, 'redeemed');
    
    // Get user's traffic data count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trafficDataCount = await TrafficData.countDocuments({
      user_id: userId,
      timestamp: { $gte: thirtyDaysAgo }
    });

    res.json({
      stats: {
        civic_points: user.civic_points,
        badges: user.badges,
        issues_reported: reportedIssues.length,
        issues_verified: verifiedIssues.length,
        coupons_redeemed: redeemedCoupons.length,
        traffic_data_contributions: trafficDataCount,
        member_since: user.created_at,
        last_active: user.last_active
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  getProfile,
  updateProfile,
  updateLocation,
  getLeaderboard,
  getUserStats
};
