const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// In-memory data storage (replaces MongoDB)
const db = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '1234567890',
      points: 150,
      role: 'user'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '0987654321',
      points: 200,
      role: 'user'
    }
  ],
  trafficData: [
    {
      id: '1',
      location: { lat: 37.7749, lng: -122.4194 },
      speed: 45,
      congestionLevel: 'medium',
      vehicleCount: 25,
      timestamp: new Date()
    },
    {
      id: '2',
      location: { lat: 34.0522, lng: -118.2437 },
      speed: 30,
      congestionLevel: 'high',
      vehicleCount: 45,
      timestamp: new Date()
    }
  ],
  issues: [
    {
      id: '1',
      reportedBy: '1',
      location: { lat: 37.7749, lng: -122.4194 },
      issueType: 'pothole',
      description: 'Large pothole on Main Street',
      severity: 'high',
      status: 'pending',
      createdAt: new Date()
    }
  ],
  emergencies: [],
  partners: [
    {
      id: '1',
      name: 'Gas Station Plus',
      category: 'fuel',
      description: '10% off fuel',
      location: { lat: 37.7749, lng: -122.4194 }
    }
  ],
  coupons: [
    {
      id: '1',
      partnerId: '1',
      title: '10% Off Fuel',
      description: 'Get 10% discount',
      pointsCost: 50,
      discountValue: 10
    }
  ],
  userCoupons: []
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('traffic-update', (data) => {
    socket.broadcast.emit('traffic-alert', data);
  });
  
  socket.on('emergency-alert', (data) => {
    io.emit('emergency-notification', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SmartRoad API Server (Standalone Mode)',
    version: '1.0.0',
    status: 'running',
    mode: 'in-memory',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      traffic: '/api/traffic',
      issues: '/api/issues',
      emergency: '/api/emergency',
      rewards: '/api/rewards'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'in-memory',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// User routes
app.post('/api/users/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const user = {
    id: String(db.users.length + 1),
    name,
    email,
    password,
    phone,
    points: 0,
    role: 'user'
  };
  
  db.users.push(user);
  
  res.status(201).json({
    success: true,
    user: { ...user, password: undefined },
    token: 'demo-token-' + user.id
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({
    success: true,
    user: { ...user, password: undefined },
    token: 'demo-token-' + user.id
  });
});

app.get('/api/users/profile', (req, res) => {
  const userId = req.headers.authorization?.split('-')[2] || '1';
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ success: true, user: { ...user, password: undefined } });
});

// Traffic routes
app.get('/api/traffic', (req, res) => {
  res.json({
    success: true,
    data: db.trafficData
  });
});

app.post('/api/traffic', (req, res) => {
  const traffic = {
    id: String(db.trafficData.length + 1),
    ...req.body,
    timestamp: new Date()
  };
  
  db.trafficData.push(traffic);
  io.emit('traffic-update', traffic);
  
  res.status(201).json({ success: true, data: traffic });
});

// Issue routes
app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    data: db.issues
  });
});

app.post('/api/issues', (req, res) => {
  const userId = req.headers.authorization?.split('-')[2] || '1';
  
  const issue = {
    id: String(db.issues.length + 1),
    reportedBy: userId,
    ...req.body,
    status: 'pending',
    createdAt: new Date()
  };
  
  db.issues.push(issue);
  
  // Award points to user
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.points += 10;
  }
  
  res.status(201).json({ success: true, data: issue });
});

// Emergency routes
app.post('/api/emergency', (req, res) => {
  const userId = req.headers.authorization?.split('-')[2] || '1';
  
  const emergency = {
    id: String(db.emergencies.length + 1),
    userId,
    ...req.body,
    status: 'active',
    createdAt: new Date()
  };
  
  db.emergencies.push(emergency);
  io.emit('emergency-alert', emergency);
  
  res.status(201).json({ success: true, data: emergency });
});

app.get('/api/emergency', (req, res) => {
  res.json({
    success: true,
    data: db.emergencies.filter(e => e.status === 'active')
  });
});

// Rewards routes
app.get('/api/rewards/coupons', (req, res) => {
  res.json({
    success: true,
    data: db.coupons
  });
});

app.post('/api/rewards/redeem', (req, res) => {
  const userId = req.headers.authorization?.split('-')[2] || '1';
  const { couponId } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  const coupon = db.coupons.find(c => c.id === couponId);
  
  if (!user || !coupon) {
    return res.status(404).json({ error: 'User or coupon not found' });
  }
  
  if (user.points < coupon.pointsCost) {
    return res.status(400).json({ error: 'Insufficient points' });
  }
  
  user.points -= coupon.pointsCost;
  
  const userCoupon = {
    id: String(db.userCoupons.length + 1),
    userId,
    couponId,
    redeemedAt: new Date()
  };
  
  db.userCoupons.push(userCoupon);
  
  res.json({
    success: true,
    data: userCoupon,
    remainingPoints: user.points
  });
});

app.get('/api/rewards/my-coupons', (req, res) => {
  const userId = req.headers.authorization?.split('-')[2] || '1';
  const userCoupons = db.userCoupons.filter(uc => uc.userId === userId);
  
  res.json({
    success: true,
    data: userCoupons
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 SmartRoad API Server (Standalone Mode)`);
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💾 Database: In-Memory (No MongoDB required)`);
  console.log(`✅ Ready for testing!\n`);
});

module.exports = { app, io };
