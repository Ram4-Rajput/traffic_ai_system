const AccidentEvent = require('../models/AccidentEvent');
const User = require('../models/User');
const RoadIssue = require('../models/RoadIssue');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Trigger emergency alert
const triggerEmergencyAlert = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      latitude,
      longitude,
      severity,
      detection_method,
      sensor_data,
      description
    } = req.body;

    // Validation
    if (!latitude || !longitude || !severity || !detection_method) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['latitude', 'longitude', 'severity', 'detection_method']
      });
    }

    // Get user info
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Generate unique event ID
    const event_id = `EMG-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create accident event
    const accidentEvent = new AccidentEvent({
      event_id,
      user_id: userId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      severity,
      detection_method,
      sensor_data: sensor_data || {},
      vehicle_info: user.vehicle_type,
      description: description || ''
    });

    await accidentEvent.save();

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Dispatch emergency services
    await accidentEvent.dispatchEmergencyServices();

    // Notify emergency contacts
    await notifyEmergencyContacts(user, accidentEvent);

    // Create related road issue if this is a confirmed accident
    if (detection_method === 'manual' || severity === 'critical') {
      const issue_id = `ISS-${uuidv4().split('-')[0].toUpperCase()}`;
      const roadIssue = new RoadIssue({
        issue_id,
        user_id: userId,
        issue_type: 'accident',
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        description: `Accident reported: ${description || 'Emergency situation'}`,
        severity: severity === 'critical' ? 'critical' : 'high',
        verified: true, // Auto-verify emergency reports
        status: 'verified',
        traffic_impact: 'severe'
      });

      await roadIssue.save();
      accidentEvent.related_issues.push(issue_id);
      await accidentEvent.save();
    }

    // Broadcast emergency alert to nearby users
    const nearbyUsers = await User.find({
      user_id: { $ne: userId },
      'last_location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 2000 // 2km radius
        }
      }
    });

    const emergencyAlert = {
      event_id: accidentEvent.event_id,
      type: 'accident',
      severity: accidentEvent.severity,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      description: 'Emergency situation detected. Please avoid this area.',
      timestamp: accidentEvent.created_at
    };

    nearbyUsers.forEach(nearbyUser => {
      io.to(`user-${nearbyUser.user_id}`).emit('emergency-notification', emergencyAlert);
    });

    // Award civic points for emergency assistance
    await user.addCivicPoints(100, 'Emergency response initiated');

    res.status(201).json({
      message: 'Emergency alert triggered successfully',
      event: {
        event_id: accidentEvent.event_id,
        severity: accidentEvent.severity,
        status: accidentEvent.status,
        location: {
          latitude: accidentEvent.location.coordinates[1],
          longitude: accidentEvent.location.coordinates[0]
        },
        emergency_services_dispatched: true,
        emergency_contacts_notified: accidentEvent.emergency_contacts_notified,
        points_awarded: 100
      }
    });

  } catch (error) {
    console.error('Trigger emergency alert error:', error);
    res.status(500).json({
      error: 'Failed to trigger emergency alert',
      message: error.message
    });
  }
};

// Confirm emergency (user confirms it's a real emergency)
const confirmEmergency = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { eventId } = req.params;

    // Find the accident event
    const accidentEvent = await AccidentEvent.findOne({ event_id: eventId });
    if (!accidentEvent) {
      return res.status(404).json({
        error: 'Emergency event not found'
      });
    }

    // Verify user is the one who triggered the alert
    if (accidentEvent.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied. Only the user who triggered the alert can confirm it.'
      });
    }

    // Confirm the emergency
    await accidentEvent.confirmAccident();

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Update nearby users about confirmed emergency
    io.emit('emergency-confirmed', {
      event_id: eventId,
      status: 'confirmed',
      severity: accidentEvent.severity
    });

    res.json({
      message: 'Emergency confirmed successfully',
      event: {
        event_id: accidentEvent.event_id,
        status: accidentEvent.status,
        verified_by_user: true,
        user_confirmation_time: accidentEvent.user_confirmation_time
      }
    });

  } catch (error) {
    console.error('Confirm emergency error:', error);
    res.status(500).json({
      error: 'Failed to confirm emergency',
      message: error.message
    });
  }
};

// Mark as false alarm
const markFalseAlarm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { eventId } = req.params;
    const { reason } = req.body;

    // Find the accident event
    const accidentEvent = await AccidentEvent.findOne({ event_id: eventId });
    if (!accidentEvent) {
      return res.status(404).json({
        error: 'Emergency event not found'
      });
    }

    // Verify user is the one who triggered the alert
    if (accidentEvent.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied. Only the user who triggered the alert can mark it as false.'
      });
    }

    // Check if emergency services have already been dispatched
    if (accidentEvent.emergency_services.ambulance.dispatched) {
      return res.status(400).json({
        error: 'Cannot mark as false alarm. Emergency services have already been dispatched.'
      });
    }

    // Mark as false alarm
    await accidentEvent.markAsFalseAlarm(reason || 'User confirmation');

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Notify nearby users that the alert was false
    io.emit('emergency-false-alarm', {
      event_id: eventId,
      status: 'false_alarm'
    });

    res.json({
      message: 'Emergency marked as false alarm',
      event: {
        event_id: accidentEvent.event_id,
        status: accidentEvent.status,
        false_alarm_reason: accidentEvent.false_alarm_reason
      }
    });

  } catch (error) {
    console.error('Mark false alarm error:', error);
    res.status(500).json({
      error: 'Failed to mark as false alarm',
      message: error.message
    });
  }
};

// Get active emergencies
const getActiveEmergencies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query;

    let query = {
      status: { $in: ['detected', 'confirmed', 'responding'] }
    };

    // If location is provided, filter by area
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const emergencies = await AccidentEvent.find(query)
      .sort({ created_at: -1 })
      .limit(50);

    res.json({
      emergencies: emergencies.map(event => ({
        event_id: event.event_id,
        severity: event.severity,
        status: event.status,
        location: {
          latitude: event.location.coordinates[1],
          longitude: event.location.coordinates[0]
        },
        detection_method: event.detection_method,
        created_at: event.created_at,
        emergency_services: {
          ambulance: {
            dispatched: event.emergency_services.ambulance.dispatched,
            eta: event.emergency_services.ambulance.eta
          },
          police: {
            dispatched: event.emergency_services.police.dispatched
          }
        }
      }))
    });

  } catch (error) {
    console.error('Get active emergencies error:', error);
    res.status(500).json({
      error: 'Failed to get active emergencies',
      message: error.message
    });
  }
};

// Get nearby emergencies for a user
const getNearbyEmergencies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    // Get user's last known location if not provided
    let userLocation = [parseFloat(longitude), parseFloat(latitude)];
    if (!latitude || !longitude) {
      const user = await User.findOne({ user_id: userId });
      if (user && user.last_location && user.last_location.coordinates) {
        userLocation = user.last_location.coordinates;
      }
    }

    const emergencies = await AccidentEvent.findNearbyEmergencies(userLocation, parseInt(radius));

    res.json({
      emergencies: emergencies.map(event => ({
        event_id: event.event_id,
        severity: event.severity,
        status: event.status,
        location: {
          latitude: event.location.coordinates[1],
          longitude: event.location.coordinates[0]
        },
        distance: calculateDistance(
          userLocation[1],
          userLocation[0],
          event.location.coordinates[1],
          event.location.coordinates[0]
        ),
        created_at: event.created_at,
        traffic_impact: event.traffic_impact
      }))
    });

  } catch (error) {
    console.error('Get nearby emergencies error:', error);
    res.status(500).json({
      error: 'Failed to get nearby emergencies',
      message: error.message
    });
  }
};

// Get emergency statistics
const getEmergencyStats = async (req, res) => {
  try {
    const { time_range = 30 } = req.query;

    const stats = await AccidentEvent.getAccidentStats(parseInt(time_range));

    res.json({
      time_range_days: parseInt(time_range),
      statistics: stats
    });

  } catch (error) {
    console.error('Get emergency stats error:', error);
    res.status(500).json({
      error: 'Failed to get emergency statistics',
      message: error.message
    });
  }
};

// Helper function to notify emergency contacts
const notifyEmergencyContacts = async (user, accidentEvent) => {
  try {
    const message = `🚨 EMERGENCY ALERT 🚨\n\n` +
      `Name: ${user.name}\n` +
      `Location: ${accidentEvent.location.coordinates[1]}, ${accidentEvent.location.coordinates[0]}\n` +
      `Time: ${accidentEvent.created_at.toLocaleString()}\n` +
      `Severity: ${accidentEvent.severity.toUpperCase()}\n\n` +
      `Please check on them immediately.`;

    // In a real implementation, use SMS service
    console.log('SMS to primary contact:', user.emergency_contact_primary, message);
    
    if (user.emergency_contact_secondary) {
      console.log('SMS to secondary contact:', user.emergency_contact_secondary, message);
    }

    // Update notification status
    accidentEvent.emergency_contacts_notified.primary = true;
    if (user.emergency_contact_secondary) {
      accidentEvent.emergency_contacts_notified.secondary = true;
    }
    await accidentEvent.save();

  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
  }
};

// Helper function to calculate distance
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
  triggerEmergencyAlert,
  confirmEmergency,
  markFalseAlarm,
  getActiveEmergencies,
  getNearbyEmergencies,
  getEmergencyStats
};
