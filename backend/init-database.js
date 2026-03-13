const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./server/models/User');
const TrafficData = require('./server/models/TrafficData');
const RoadIssue = require('./server/models/RoadIssue');
const Partner = require('./server/models/Partner');
const Coupon = require('./server/models/Coupon');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartroad');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await TrafficData.deleteMany({});
    await RoadIssue.deleteMany({});
    await Partner.deleteMany({});
    await Coupon.deleteMany({});

    // Create sample users
    console.log('👥 Creating sample users...');
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user',
        points: 150
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '0987654321',
        role: 'user',
        points: 200
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create sample traffic data
    console.log('🚗 Creating sample traffic data...');

    const trafficData = await TrafficData.create([
      {
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749] // San Francisco
        },
        speed: 45,
        congestionLevel: 'medium',
        vehicleCount: 25,
        timestamp: new Date()
      },
      {
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522] // Los Angeles
        },
        speed: 30,
        congestionLevel: 'high',
        vehicleCount: 45,
        timestamp: new Date()
      }
    ]);
    console.log(`✅ Created ${trafficData.length} traffic data entries`);

    // Create sample road issues
    console.log('🚧 Creating sample road issues...');
    const issues = await RoadIssue.create([
      {
        reportedBy: users[0]._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        issueType: 'pothole',
        description: 'Large pothole on Main Street',
        severity: 'high',
        status: 'pending'
      },
      {
        reportedBy: users[1]._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522]
        },
        issueType: 'traffic_light',
        description: 'Traffic light not working',
        severity: 'critical',
        status: 'in_progress'
      }
    ]);
    console.log(`✅ Created ${issues.length} road issues`);

    // Create sample partners
    console.log('🤝 Creating sample partners...');

    const partners = await Partner.create([
      {
        name: 'Gas Station Plus',
        category: 'fuel',
        description: 'Premium fuel and convenience store',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        contactEmail: 'contact@gasstationplus.com',
        contactPhone: '555-0100',
        isActive: true
      },
      {
        name: 'Quick Cafe',
        category: 'food',
        description: 'Coffee and quick bites',
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522]
        },
        contactEmail: 'info@quickcafe.com',
        contactPhone: '555-0200',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${partners.length} partners`);

    // Create sample coupons
    console.log('🎁 Creating sample coupons...');
    const coupons = await Coupon.create([
      {
        partner: partners[0]._id,
        title: '10% Off Fuel',
        description: 'Get 10% discount on fuel purchase',
        discountType: 'percentage',
        discountValue: 10,
        pointsCost: 50,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        maxRedemptions: 100
      },
      {
        partner: partners[1]._id,
        title: 'Free Coffee',
        description: 'Get a free coffee with any purchase',
        discountType: 'fixed',
        discountValue: 5,
        pointsCost: 30,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        maxRedemptions: 200
      }
    ]);
    console.log(`✅ Created ${coupons.length} coupons`);

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Traffic Data: ${trafficData.length}`);
    console.log(`   Road Issues: ${issues.length}`);
    console.log(`   Partners: ${partners.length}`);
    console.log(`   Coupons: ${coupons.length}`);
    console.log('\n✅ You can now test the full app functionality!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run initialization
initializeDatabase();
