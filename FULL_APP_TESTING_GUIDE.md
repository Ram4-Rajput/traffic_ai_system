# 🧪 Complete App Functionality Testing Guide

## Current Status
✅ Backend API - Running on port 5000
✅ AI Services - Running on port 8000
⚠️ MongoDB - NOT CONNECTED (needed for full functionality)

## 🎯 Goal: Test Complete App with Database

To test the FULL app functionality (not just frontend), you need MongoDB running.

## 📋 Step-by-Step Setup

### Step 1: Install MongoDB

Choose ONE option:

#### Option A: MongoDB Community (Recommended - 5 minutes)
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. ✅ Check "Install as Windows Service"
4. MongoDB starts automatically

#### Option B: Docker Desktop (If you prefer containers)
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop
3. Run in Command Prompt:
   ```cmd
   cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\docker
   docker-compose up -d mongodb redis
   ```

#### Option C: MongoDB Atlas (Cloud - No installation)
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Get connection string
4. Update backend/.env with your connection string

### Step 2: Verify MongoDB is Running

Open Command Prompt:
```cmd
mongo --version
```

Or check if service is running:
```cmd
net start | findstr MongoDB
```


### Step 3: Initialize Database with Sample Data

Once MongoDB is running, populate it with test data:

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\backend
node init-database.js
```

This creates:
- 2 sample users
- Traffic data
- Road issues
- Partner businesses
- Reward coupons

### Step 4: Verify Backend Connection

Open browser: http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "database": "connected",  ← Must say "connected"!
  "timestamp": "...",
  "uptime": ...
}
```

### Step 5: Start Mobile App

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npm start
```

Press `w` to open in browser or scan QR code with Expo Go app.

## 🧪 Test Complete Functionality

### 1. User Registration & Login

#### Test Registration:
1. Open mobile app
2. Click "Register"
3. Fill in details:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
   - Phone: 1234567890
4. Click "Register"
5. ✅ Should create account and log you in

#### Test Login:
1. Use sample account:
   - Email: john@example.com
   - Password: password123
2. Click "Login"
3. ✅ Should log you in and show dashboard

### 2. View Traffic Data

1. Go to Dashboard
2. ✅ Should see real-time traffic map
3. ✅ Should see traffic congestion levels
4. ✅ Should see vehicle counts

### 3. Report Road Issue

1. Click "Report Issue"
2. Select issue type (pothole, traffic light, etc.)
3. Add description
4. Take/upload photo (optional)
5. Submit
6. ✅ Issue should be saved to database
7. ✅ Should appear in issues list


### 4. Emergency Alert

1. Click Emergency button
2. Select emergency type
3. Confirm alert
4. ✅ Alert should be sent to backend
5. ✅ Should notify nearby users (via Socket.IO)
6. ✅ Should create green corridor for ambulance

### 5. Rewards System

1. Go to Rewards section
2. ✅ Should see your points balance
3. ✅ Should see available coupons
4. Click on a coupon
5. Redeem with points
6. ✅ Coupon should be added to your account
7. ✅ Points should be deducted

### 6. Navigation

1. Enter destination
2. ✅ Should calculate route
3. ✅ Should show traffic conditions
4. ✅ Should suggest alternative routes
5. ✅ Should show ETA

## 🔍 Backend API Testing

Test APIs directly with PowerShell:

### Test User Registration:
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    phone = "1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/register" -Method POST -Body $body -ContentType "application/json"
```

### Test Login:
```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Test Traffic Data:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/traffic" -Method GET
```

### Test Issue Reporting:
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}
$body = @{
    issueType = "pothole"
    description = "Large pothole on Main St"
    severity = "high"
    location = @{
        latitude = 37.7749
        longitude = -122.4194
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/issues" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```


## 🤖 AI Services Testing

### Test Traffic Prediction:
```powershell
$body = @{
    location = @{
        latitude = 37.7749
        longitude = -122.4194
    }
    time_horizon = 60
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/traffic/predict" -Method POST -Body $body -ContentType "application/json"
```

### Test Vehicle Detection:
Upload an image to detect vehicles (requires image file).

### Test Signal Optimization:
```powershell
$body = @{
    intersection_id = "INT001"
    traffic_data = @{
        north_count = 25
        south_count = 30
        east_count = 15
        west_count = 20
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/signals/optimize" -Method POST -Body $body -ContentType "application/json"
```

## ✅ Success Checklist

After MongoDB is running, verify:

- [ ] Backend health shows "database": "connected"
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view traffic data
- [ ] Can report road issues
- [ ] Can trigger emergency alerts
- [ ] Can view and redeem rewards
- [ ] Mobile app connects to backend
- [ ] Real-time updates work (Socket.IO)
- [ ] AI predictions work
- [ ] Data persists after refresh

## 🎯 Quick Start Command

If MongoDB is already installed and running:

```cmd
REM Initialize database with sample data
cd backend
node init-database.js

REM Verify backend connection
curl http://localhost:5000/api/health

REM Start mobile app
cd ..\mobile
npm start
```

Then press `w` to open in browser!

## 📊 What's Different with MongoDB?

### Without MongoDB (Current):
- ❌ Data doesn't save
- ❌ Users can't register/login
- ❌ Issues aren't stored
- ✅ UI works
- ✅ Navigation works

### With MongoDB (Full Functionality):
- ✅ All data persists
- ✅ User authentication works
- ✅ Issues are stored and tracked
- ✅ Rewards system functional
- ✅ Real-time updates
- ✅ Complete app experience

---

**Ready to test the complete app?** Install MongoDB and run the initialization script! 🚀
