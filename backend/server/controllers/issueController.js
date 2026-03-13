const RoadIssue = require('../models/RoadIssue');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Configure multer for photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Report a new road issue
const reportIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      issue_type,
      latitude,
      longitude,
      description,
      severity,
      address
    } = req.body;

    // Validation
    if (!issue_type || !latitude || !longitude || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['issue_type', 'latitude', 'longitude', 'description']
      });
    }

    // Get user info
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check for duplicate issues in the area
    const nearbyIssues = await RoadIssue.checkForDuplicates(
      [parseFloat(longitude), parseFloat(latitude)],
      50 // 50 meters threshold
    );

    if (nearbyIssues.length > 0) {
      return res.status(409).json({
        error: 'Similar issue already reported in this area',
        duplicate_issue: nearbyIssues[0].issue_id
      });
    }

    // Generate unique issue ID
    const issue_id = `ISS-${uuidv4().split('-')[0].toUpperCase()}`;

    // Handle photo uploads
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      // In a real implementation, upload to cloud storage
      // For demo, we'll simulate the URLs
      photoUrls = req.files.map((file, index) => 
        `https://storage.smartroad.com/issues/${issue_id}_photo_${index + 1}.jpg`
      );
    }

    // Create new road issue
    const issue = new RoadIssue({
      issue_id,
      user_id: userId,
      issue_type,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address: address || {},
      description: description.trim(),
      photo_url: photoUrls,
      severity: severity || 'medium',
      traffic_impact: getTrafficImpact(issue_type, severity)
    });

    await issue.save();

    // Award civic points for reporting
    await user.addCivicPoints(50, `Reported ${issue_type}`);

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Send verification requests to nearby users
    const nearbyUsers = await User.find({
      user_id: { $ne: userId },
      'last_location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 500 // 500m radius
        }
      }
    });

    const verificationRequest = {
      issue_id: issue.issue_id,
      issue_type: issue.issue_type,
      description: issue.description,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      distance: 'nearby',
      timestamp: issue.created_at
    };

    nearbyUsers.forEach(nearbyUser => {
      io.to(`user-${nearbyUser.user_id}`).emit('issue-verification-request', verificationRequest);
    });

    res.status(201).json({
      message: 'Issue reported successfully',
      issue: {
        issue_id: issue.issue_id,
        issue_type: issue.issue_type,
        location: {
          latitude: issue.location.coordinates[1],
          longitude: issue.location.coordinates[0]
        },
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        verified: issue.verified,
        created_at: issue.created_at,
        points_awarded: 50
      }
    });

  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      error: 'Failed to report issue',
      message: error.message
    });
  }
};

// Verify an issue reported by another user
const verifyIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { issue_id, is_present, comment } = req.body;

    if (!issue_id || is_present === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: issue_id, is_present'
      });
    }

    // Find the issue
    const issue = await RoadIssue.findOne({ issue_id });
    if (!issue) {
      return res.status(404).json({
        error: 'Issue not found'
      });
    }

    // Check if user already verified this issue
    const alreadyVerified = issue.verification_details.some(
      verification => verification.user_id === userId
    );

    if (alreadyVerified) {
      return res.status(409).json({
        error: 'You have already verified this issue'
      });
    }

    // Check if user is the reporter
    if (issue.user_id === userId) {
      return res.status(403).json({
        error: 'You cannot verify your own report'
      });
    }

    // Add verification
    await issue.addVerification(userId, is_present, comment);

    // Award civic points for verification
    const user = await User.findOne({ user_id: userId });
    if (user) {
      const points = is_present ? 20 : 10;
      await user.addCivicPoints(points, `Verified issue: ${issue_id}`);
    }

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Notify the original reporter
    io.to(`user-${issue.user_id}`).emit('issue-verified', {
      issue_id: issue.issue_id,
      verified_by: userId,
      is_present,
      verification_count: issue.verification_count,
      verified: issue.verified
    });

    res.json({
      message: 'Issue verification submitted successfully',
      verification: {
        issue_id: issue.issue_id,
        verified: issue.verified,
        verification_count: issue.verification_count,
        points_awarded: is_present ? 20 : 10
      }
    });

  } catch (error) {
    console.error('Verify issue error:', error);
    res.status(500).json({
      error: 'Failed to verify issue',
      message: error.message
    });
  }
};

// Get nearby issues
const getNearbyIssues = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude, radius = 1000, issue_type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const radiusMeters = parseInt(radius);

    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radiusMeters
        }
      },
      status: { $in: ['reported', 'verified', 'in_progress'] }
    };

    if (issue_type) {
      query.issue_type = issue_type;
    }

    const issues = await RoadIssue.find(query)
      .sort({ created_at: -1 })
      .limit(50);

    // Mark issues that the user can verify
    const issuesWithVerificationStatus = issues.map(issue => ({
      issue_id: issue.issue_id,
      issue_type: issue.issue_type,
      description: issue.description,
      location: {
        latitude: issue.location.coordinates[1],
        longitude: issue.location.coordinates[0]
      },
      severity: issue.severity,
      status: issue.status,
      verified: issue.verified,
      verification_count: issue.verification_count,
      created_at: issue.created_at,
      can_verify: issue.user_id !== userId && 
        !issue.verification_details.some(v => v.user_id === userId) &&
        !issue.verified,
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        issue.location.coordinates[1],
        issue.location.coordinates[0]
      )
    }));

    res.json({
      issues: issuesWithVerificationStatus,
      center: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      radius: radiusMeters
    });

  } catch (error) {
    console.error('Get nearby issues error:', error);
    res.status(500).json({
      error: 'Failed to get nearby issues',
      message: error.message
    });
  }
};

// Get user's reported issues
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, page = 1 } = req.query;

    let query = { user_id: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await RoadIssue.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RoadIssue.countDocuments(query);

    res.json({
      issues: issues.map(issue => ({
        issue_id: issue.issue_id,
        issue_type: issue.issue_type,
        description: issue.description,
        location: {
          latitude: issue.location.coordinates[1],
          longitude: issue.location.coordinates[0]
        },
        severity: issue.severity,
        status: issue.status,
        verified: issue.verified,
        verification_count: issue.verification_count,
        points_earned: issue.verified ? 50 : 0,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      error: 'Failed to get user reports',
      message: error.message
    });
  }
};

// Get issue statistics
const getIssueStats = async (req, res) => {
  try {
    const { time_range = 7 } = req.query;

    const stats = await RoadIssue.getIssueStats(parseInt(time_range));

    res.json({
      time_range_days: parseInt(time_range),
      statistics: stats
    });

  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      error: 'Failed to get issue statistics',
      message: error.message
    });
  }
};

// Update issue (for status changes, etc.)
const updateIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { issueId } = req.params;
    const updates = req.body;

    // Find the issue
    const issue = await RoadIssue.findOne({ issue_id: issueId });
    if (!issue) {
      return res.status(404).json({
        error: 'Issue not found'
      });
    }

    // Only the original reporter or admin can update
    if (issue.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied. Only the reporter can update this issue.'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['description', 'severity', 'photo_url'];
    const actualUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    if (Object.keys(actualUpdates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update'
      });
    }

    Object.assign(issue, actualUpdates);
    await issue.save();

    res.json({
      message: 'Issue updated successfully',
      issue: {
        issue_id: issue.issue_id,
        updated_fields: Object.keys(actualUpdates),
        updated_at: issue.updated_at
      }
    });

  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      error: 'Failed to update issue',
      message: error.message
    });
  }
};

// Helper functions
const getTrafficImpact = (issueType, severity) => {
  const impactMap = {
    pothole: { low: 'minor', medium: 'moderate', high: 'major', critical: 'severe' },
    roadblock: { low: 'moderate', medium: 'major', high: 'severe', critical: 'severe' },
    waterlogging: { low: 'minor', medium: 'moderate', high: 'major', critical: 'severe' },
    broken_signal: { low: 'moderate', medium: 'major', high: 'severe', critical: 'severe' },
    accident: { low: 'major', medium: 'severe', high: 'severe', critical: 'severe' }
  };

  return impactMap[issueType]?.[severity] || 'moderate';
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 1000); // Distance in meters
};

module.exports = {
  reportIssue: [upload.array('photos', 3), reportIssue],
  verifyIssue,
  getNearbyIssues,
  getMyReports,
  getIssueStats,
  updateIssue
};
