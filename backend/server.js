const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const userRoutes = require('./server/routes/userRoutes');
const trafficRoutes = require('./server/routes/trafficRoutes');
const issueRoutes = require('./server/routes/issueRoutes');
const emergencyRoutes = require('./server/routes/emergencyRoutes');
const rewardsRoutes = require('./server/routes/rewardsRoutes');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartroad', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for targeted updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle real-time traffic updates
  socket.on('traffic-update', (data) => {
    // Broadcast traffic updates to nearby users
    socket.broadcast.emit('traffic-alert', data);
  });

  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    // Broadcast to emergency services and nearby users
    io.emit('emergency-notification', data);
  });

  // Handle issue verification requests
  socket.on('issue-verification-request', (data) => {
    // Send to nearby users for verification
    socket.broadcast.emit('verify-issue', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 SmartRoad API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      traffic: '/api/traffic',
      issues: '/api/issues',
      emergency: '/api/emergency',
      rewards: '/api/rewards'
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/rewards', rewardsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`SmartRoad API Server running on port ${PORT}`);
});

module.exports = { app, io };
