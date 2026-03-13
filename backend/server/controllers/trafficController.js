const TrafficData = require('../models/TrafficData');
const User = require('../models/User');
const RoadIssue = require('../models/RoadIssue');

// Update traffic data from user
const updateTrafficData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      latitude,
      longitude,
      speed,
      heading,
      road_id,
      road_name,
      weather_condition
    } = req.body;

    // Validation
    if (!latitude || !longitude || speed === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, speed'
      });
    }

    // Get user info
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create traffic data entry
    const trafficData = new TrafficData({
      user_id: userId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      speed: parseFloat(speed),
      heading: heading ? parseFloat(heading) : null,
      road_id: road_id || null,
      road_name: road_name || null,
      vehicle_type: user.vehicle_type,
      weather_condition: weather_condition || 'clear'
    });

    await trafficData.save();

    // Update user's last location
    await user.updateLastLocation(latitude, longitude);

    // Award civic points for contributing traffic data
    await user.addCivicPoints(5, 'Traffic data contribution');

    // Get Socket.IO instance from app
    const io = req.app.get('io');
    
    // Broadcast traffic update to nearby users
    const nearbyUsers = await User.find({
      user_id: { $ne: userId },
      'last_location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 1000 // 1km radius
        }
      }
    });

    nearbyUsers.forEach(nearbyUser => {
      io.to(`user-${nearbyUser.user_id}`).emit('traffic-update', {
        location: { latitude, longitude },
        speed: parseFloat(speed),
        congestion_level: trafficData.congestion_level,
        timestamp: trafficData.timestamp
      });
    });

    res.json({
      message: 'Traffic data updated successfully',
      data: {
        speed: trafficData.speed,
        congestion_level: trafficData.congestion_level,
        points_awarded: 5
      }
    });

  } catch (error) {
    console.error('Update traffic data error:', error);
    res.status(500).json({
      error: 'Failed to update traffic data',
      message: error.message
    });
  }
};

// Get congestion data for specific area
const getCongestionData = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 2000, // default 2km
      time_range = 300 // default 5 minutes
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const radiusMeters = parseInt(radius);
    const timeRangeSeconds = parseInt(time_range);

    // Get traffic data for the area
    const trafficData = await TrafficData.getTrafficByArea(coordinates, radiusMeters);

    // Calculate congestion metrics
    const totalVehicles = trafficData.length;
    const avgSpeed = totalVehicles > 0 
      ? trafficData.reduce((sum, data) => sum + data.speed, 0) / totalVehicles 
      : 0;

    let congestionLevel = 'low';
    if (avgSpeed < 20) {
      congestionLevel = 'severe';
    } else if (avgSpeed < 40) {
      congestionLevel = 'high';
    } else if (avgSpeed < 60) {
      congestionLevel = 'medium';
    }

    // Get road issues in the area that might affect traffic
    const roadIssues = await RoadIssue.findNearbyIssues(coordinates, radiusMeters);

    res.json({
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radius: radiusMeters,
      congestion: {
        level: congestionLevel,
        vehicle_count: totalVehicles,
        average_speed: Math.round(avgSpeed * 10) / 10,
        time_range: timeRangeSeconds
      },
      affecting_issues: roadIssues.map(issue => ({
        issue_id: issue.issue_id,
        type: issue.issue_type,
        severity: issue.severity,
        traffic_impact: issue.traffic_impact,
        location: {
          latitude: issue.location.coordinates[1],
          longitude: issue.location.coordinates[0]
        }
      }))
    });

  } catch (error) {
    console.error('Get congestion data error:', error);
    res.status(500).json({
      error: 'Failed to get congestion data',
      message: error.message
    });
  }
};

// Get traffic heatmap data
const getTrafficHeatmap = async (req, res) => {
  try {
    const { 
      north, 
      south, 
      east, 
      west,
      time_range = 1800 // default 30 minutes
    } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({
        error: 'Bounding box coordinates are required: north, south, east, west'
      });
    }

    const since = new Date(Date.now() - parseInt(time_range) * 1000);

    // Create bounding box query
    const boundingBox = {
      type: 'Polygon',
      coordinates: [[
        [parseFloat(west), parseFloat(south)],
        [parseFloat(east), parseFloat(south)],
        [parseFloat(east), parseFloat(north)],
        [parseFloat(west), parseFloat(north)],
        [parseFloat(west), parseFloat(south)]
      ]]
    };

    // Get traffic data within bounding box
    const trafficData = await TrafficData.aggregate([
      {
        $match: {
          location: {
            $geoWithin: {
              $geometry: boundingBox
            }
          },
          timestamp: { $gte: since }
        }
      },
      {
        $group: {
          _id: {
            // Group by grid cells (approximately 100m x 100m)
            lat: { $trunc: { $multiply: ['$location.coordinates.1', 1000] } },
            lng: { $trunc: { $multiply: ['$location.coordinates.0', 1000] } }
          },
          count: { $sum: 1 },
          avgSpeed: { $avg: '$speed' },
          maxSpeed: { $max: '$speed' },
          minSpeed: { $min: '$speed' }
        }
      },
      {
        $project: {
          _id: 0,
          latitude: { $divide: ['$_id.lat', 1000] },
          longitude: { $divide: ['$_id.lng', 1000] },
          intensity: '$count',
          avgSpeed: { $round: ['$avgSpeed', 1] },
          maxSpeed: '$maxSpeed',
          minSpeed: '$minSpeed'
        }
      }
    ]);

    res.json({
      heatmap: trafficData,
      bounding_box: {
        north: parseFloat(north),
        south: parseFloat(south),
        east: parseFloat(east),
        west: parseFloat(west)
      },
      time_range: parseInt(time_range)
    });

  } catch (error) {
    console.error('Get traffic heatmap error:', error);
    res.status(500).json({
      error: 'Failed to get traffic heatmap',
      message: error.message
    });
  }
};

// Get optimal route using A* algorithm
const getOptimalRoute = async (req, res) => {
  try {
    const { 
      origin_lat, 
      origin_lng, 
      dest_lat, 
      dest_lng,
      avoid_tolls = false,
      avoid_highways = false
    } = req.query;

    if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
      return res.status(400).json({
        error: 'Origin and destination coordinates are required'
      });
    }

    // For demo purposes, we'll create a mock route
    // In a real implementation, this would use OpenStreetMap data and A* pathfinding
    
    const origin = {
      latitude: parseFloat(origin_lat),
      longitude: parseFloat(origin_lng)
    };

    const destination = {
      latitude: parseFloat(dest_lat),
      longitude: parseFloat(dest_lng)
    };

    // Calculate direct distance (simplified)
    const R = 6371; // Earth's radius in km
    const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Get traffic conditions along the route
    const routeCoordinates = [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude]
    ];

    // Check for congestion and issues
    const congestionData = await TrafficData.getTrafficByArea(
      [(origin.longitude + destination.longitude) / 2, (origin.latitude + destination.latitude) / 2],
      distance * 1000 // Convert km to meters
    );

    const avgSpeed = congestionData.length > 0 
      ? congestionData.reduce((sum, data) => sum + data.speed, 0) / congestionData.length 
      : 60; // Default speed

    const estimatedTime = (distance / avgSpeed) * 60; // in minutes

    // Get road issues along the route
    const routeIssues = await RoadIssue.find({
      location: {
        $geoWithin: {
          $geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      },
      status: { $in: ['reported', 'verified', 'in_progress'] }
    });

    res.json({
      route: {
        origin,
        destination,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        estimated_time: Math.round(estimatedTime),
        average_speed: Math.round(avgSpeed),
        traffic_level: avgSpeed < 40 ? 'heavy' : avgSpeed < 60 ? 'moderate' : 'light'
      },
      coordinates: routeCoordinates,
      alerts: routeIssues.map(issue => ({
        type: issue.issue_type,
        severity: issue.severity,
        description: issue.description,
        location: {
          latitude: issue.location.coordinates[1],
          longitude: issue.location.coordinates[0]
        }
      })),
      alternatives: [] // In a real implementation, this would include alternative routes
    });

  } catch (error) {
    console.error('Get optimal route error:', error);
    res.status(500).json({
      error: 'Failed to get optimal route',
      message: error.message
    });
  }
};

// Get traffic history for a user
const getTrafficHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { 
      start_date, 
      end_date,
      limit = 100
    } = req.query;

    // Verify user is requesting their own data
    if (userId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access denied. You can only view your own traffic history.'
      });
    }

    let query = { user_id: userId };
    
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) {
        query.timestamp.$gte = new Date(start_date);
      }
      if (end_date) {
        query.timestamp.$lte = new Date(end_date);
      }
    }

    const trafficHistory = await TrafficData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      history: trafficHistory.map(data => ({
        timestamp: data.timestamp,
        location: {
          latitude: data.location.coordinates[1],
          longitude: data.location.coordinates[0]
        },
        speed: data.speed,
        heading: data.heading,
        road_id: data.road_id,
        road_name: data.road_name,
        congestion_level: data.congestion_level
      }))
    });

  } catch (error) {
    console.error('Get traffic history error:', error);
    res.status(500).json({
      error: 'Failed to get traffic history',
      message: error.message
    });
  }
};

// Get traffic analytics
const getTrafficAnalytics = async (req, res) => {
  try {
    const { 
      area, // 'city', 'highway', 'residential'
      time_period = '24h' // '1h', '24h', '7d', '30d'
    } = req.query;

    let timeRange;
    switch (time_period) {
      case '1h':
        timeRange = 3600; // 1 hour in seconds
        break;
      case '24h':
        timeRange = 86400; // 24 hours in seconds
        break;
      case '7d':
        timeRange = 604800; // 7 days in seconds
        break;
      case '30d':
        timeRange = 2592000; // 30 days in seconds
        break;
      default:
        timeRange = 86400;
    }

    const since = new Date(Date.now() - timeRange * 1000);

    // Aggregate traffic data
    const analytics = await TrafficData.aggregate([
      {
        $match: {
          timestamp: { $gte: since }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            vehicle_type: '$vehicle_type'
          },
          count: { $sum: 1 },
          avgSpeed: { $avg: '$speed' },
          maxSpeed: { $max: '$speed' },
          minSpeed: { $min: '$speed' }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          vehicleTypes: {
            $push: {
              type: '$_id.vehicle_type',
              count: '$count',
              avgSpeed: '$avgSpeed'
            }
          },
          totalVehicles: { $sum: '$count' },
          overallAvgSpeed: { $avg: '$avgSpeed' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get congestion trends
    const congestionTrends = await TrafficData.aggregate([
      {
        $match: {
          timestamp: { $gte: since }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            congestion_level: '$congestion_level'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          levels: {
            $push: {
              level: '$_id.congestion_level',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      time_period: time_period,
      hourly_patterns: analytics,
      congestion_trends: congestionTrends,
      summary: {
        total_data_points: analytics.reduce((sum, hour) => sum + hour.totalVehicles, 0),
        average_speed: analytics.length > 0 
          ? analytics.reduce((sum, hour) => sum + hour.overallAvgSpeed, 0) / analytics.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Get traffic analytics error:', error);
    res.status(500).json({
      error: 'Failed to get traffic analytics',
      message: error.message
    });
  }
};

module.exports = {
  updateTrafficData,
  getCongestionData,
  getTrafficHeatmap,
  getOptimalRoute,
  getTrafficHistory,
  getTrafficAnalytics
};
