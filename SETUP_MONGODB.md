# 🗄️ MongoDB Setup for Full App Functionality

## Current Status
Your backend and AI services are running but WITHOUT database connection.
This means:
- ❌ User registration/login won't work
- ❌ Data won't be saved
- ❌ Traffic data won't persist
- ❌ Issue reports won't be stored

## ✅ Solution: Install MongoDB Locally

### Option 1: MongoDB Community Edition (Recommended)

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (Current)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

#### Step 2: Install MongoDB
1. Run the downloaded .msi file
2. Choose "Complete" installation
3. ✅ Check "Install MongoDB as a Service"
4. ✅ Check "Run service as Network Service user"
5. ✅ Check "Install MongoDB Compass" (GUI tool)
6. Click "Install"

#### Step 3: Verify Installation
Open Command Prompt and run:
```cmd
mongod --version
```

You should see MongoDB version information.

#### Step 4: Start MongoDB Service
MongoDB should start automatically. To verify:
```cmd
net start MongoDB
```


### Option 2: Docker Desktop (Alternative)

#### Step 1: Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install Docker Desktop
3. Start Docker Desktop application
4. Wait for it to fully start (whale icon in system tray)

#### Step 2: Start MongoDB with Docker
Open Command Prompt in your project folder:
```cmd
cd docker
docker-compose up -d mongodb redis
```

This will:
- Download MongoDB and Redis images
- Start both services
- Keep them running in background

#### Step 3: Verify Docker Services
```cmd
docker ps
```

You should see mongodb and redis containers running.

## 🔄 Restart Your Services

After MongoDB is installed and running:

### Step 1: Check MongoDB is Running
```cmd
mongo --version
```
Or check if port 27017 is listening.

### Step 2: Your Backend Will Auto-Reconnect
The backend is already running and will automatically connect to MongoDB once it's available!

Check: http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "database": "connected",  ← Should say "connected" now!
  "timestamp": "...",
  "uptime": ...
}
```


## 🧪 Test Full Functionality

Once MongoDB is running, test these features:

### 1. Test User Registration
```bash
# PowerShell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    phone = "1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/register" -Method POST -Body $body -ContentType "application/json"
```

### 2. Test Traffic Data
```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/traffic" -Method GET
```

### 3. Check Database Connection
```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

## 📱 Mobile App with Full Backend

Once MongoDB is running:

1. Start mobile app: `cd mobile && npm start`
2. Press `w` for web or scan QR code
3. Try these features:
   - ✅ User registration
   - ✅ Login
   - ✅ Report issues (with photos)
   - ✅ View traffic data
   - ✅ Emergency alerts
   - ✅ Earn rewards

## 🎯 Quick Start (If MongoDB Already Installed)

If you already have MongoDB installed:

```cmd
# Start MongoDB service
net start MongoDB

# Check backend health
curl http://localhost:5000/api/health

# Start mobile app
cd mobile
npm start
```

## ⚡ Alternative: Use MongoDB Atlas (Cloud)

Don't want to install locally? Use MongoDB's free cloud service:

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (M0)
4. Get connection string
5. Update backend/.env:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartroad
   ```
6. Restart backend

---

**Choose your option and get full app functionality!** 🚀
