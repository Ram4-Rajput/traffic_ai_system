# 🎯 Complete SmartRoad App - Running Guide

## ✅ Current Status

| Component | Status | Port | Action |
|-----------|--------|------|--------|
| Backend API | ✅ RUNNING | 5000 | http://localhost:5000 |
| AI Services | ⏳ Installing | 8000 | Will start after install |
| Mobile App | ⏳ Ready | - | Need to start |
| MongoDB | ⏳ Need Docker | 27017 | Start Docker Desktop |
| Redis | ⏳ Need Docker | 6379 | Start Docker Desktop |

## 🚀 Quick Start (3 Steps)

### Step 1: Start Docker Desktop (Important!)
1. Open **Docker Desktop** from Windows Start Menu
2. Wait 1-2 minutes for it to fully start
3. Look for whale icon in system tray (should be solid, not animated)

### Step 2: Start All Services with Docker
Open PowerShell/Terminal:
```bash
cd docker
docker-compose up
```

Wait 2-3 minutes. You'll see:
```
✓ MongoDB started
✓ Redis started  
✓ Backend started
✓ AI Services started
✓ Nginx started
```

### Step 3: Start Mobile App
Open a NEW terminal:
```bash
cd mobile
npx expo start
```

Then:
- Install **Expo Go** app on your phone
- Scan the QR code
- App loads on your phone!

## 📱 Mobile App Setup Details

### Install Expo Go:
- **Android**: Google Play Store → Search "Expo Go"
- **iOS**: App Store → Search "Expo Go"

### After running `npx expo start`:
1. QR code appears in terminal
2. Open Expo Go app on phone
3. Tap "Scan QR Code"
4. Point camera at QR code
5. App loads automatically!

### Alternative - Use Emulator:
- Press **'a'** for Android emulator (if installed)
- Press **'w'** for web browser version

## 🌐 Access All Services

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend Dashboard | http://localhost:5000 | - |
| Backend API | http://localhost:5000/api/health | - |
| AI Services | http://localhost:8000 | - |
| AI Docs | http://localhost:8000/docs | - |
| Grafana | http://localhost:3001 | admin / smartroad2024 |
| Prometheus | http://localhost:9090 | - |

## 🎮 Using the Mobile App

### Features You Can Test:

1. **Dashboard**
   - View real-time traffic
   - See nearby issues
   - Check your rewards

2. **Navigation**
   - Enter destination
   - Get AI-optimized route
   - Avoid traffic congestion

3. **Report Issues**
   - Take photo of road problem
   - Add description
   - Submit report
   - Earn civic points!

4. **Emergency Alert**
   - One-tap emergency button
   - Automatic location sharing
   - Green corridor activation

5. **Rewards**
   - View your points
   - Browse available coupons
   - Redeem rewards
   - Check leaderboard

## 🔧 Troubleshooting

### Backend shows "Database: disconnected"
→ Docker Desktop not running
→ Start Docker Desktop and run `docker-compose up`

### Mobile app can't connect to backend
→ Make sure backend is running (http://localhost:5000)
→ Check if phone and computer are on same WiFi
→ Update API URL in mobile app if needed

### AI Services won't start
→ Python dependencies still installing (check terminal)
→ Wait for installation to complete
→ Then run: `cd ai && py main.py`

### Docker won't start
→ Restart computer
→ Update Docker Desktop
→ Check if Hyper-V is enabled (Windows Settings)

### Port already in use
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F
```

## 📊 What Each Service Does

### Backend API (Port 5000)
- User registration & login
- Traffic data management
- Issue reporting
- Emergency alerts
- Rewards system
- Real-time Socket.IO updates

### AI Services (Port 8000)
- Traffic prediction using ML
- Vehicle detection (YOLOv8)
- Signal optimization
- Emergency corridor routing
- Congestion analysis

### MongoDB (Port 27017)
- Stores all application data
- User profiles
- Traffic records
- Issues and reports
- Rewards and coupons

### Redis (Port 6379)
- Caching layer
- Session management
- Real-time data
- Performance optimization

## 🎯 Testing the Complete Flow

### 1. Register a User
- Open mobile app
- Tap "Register"
- Enter phone number
- Verify OTP
- Complete profile

### 2. Report an Issue
- Tap "Report Issue"
- Take photo
- Add description
- Submit
- Earn 10 civic points!

### 3. View Traffic
- Open "Explore" tab
- See real-time traffic map
- View congestion levels
- Check nearby issues

### 4. Test Emergency
- Tap "Emergency" button
- Confirm alert
- Green corridor activates
- Signals optimize route

## 📈 Monitoring & Logs

### View Backend Logs:
```bash
cd docker
docker-compose logs -f backend
```

### View AI Service Logs:
```bash
docker-compose logs -f ai-services
```

### View All Logs:
```bash
docker-compose logs -f
```

### Check Service Status:
```bash
docker-compose ps
```

## 🛑 Stopping Services

### Stop All Docker Services:
```bash
cd docker
docker-compose down
```

### Stop Mobile App:
Press `Ctrl+C` in the terminal running Expo

### Stop Individual Service:
```bash
docker-compose stop backend
docker-compose stop ai-services
```

## 🔄 Restarting Services

### Restart All:
```bash
docker-compose restart
```

### Restart One Service:
```bash
docker-compose restart backend
```

### Rebuild and Restart:
```bash
docker-compose up --build
```

## 📝 Quick Commands Reference

```bash
# Start everything
cd docker && docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart service
docker-compose restart backend

# Start mobile app
cd mobile && npx expo start

# Install mobile dependencies
cd mobile && npm install

# Install AI dependencies
cd ai && py -m pip install -r requirements.txt
```

## 🎉 You're All Set!

### Current Running:
✅ Backend API on port 5000

### To Complete Setup:
1. ⏳ Wait for AI dependencies to finish installing
2. ⏳ Start Docker Desktop
3. ⏳ Run `docker-compose up` in docker folder
4. ⏳ Run `npx expo start` in mobile folder
5. ✅ Scan QR code with Expo Go app
6. 🎊 Start using SmartRoad!

## 📞 Need Help?

Check these files:
- `RUN_COMPLETE_APP.md` - Detailed instructions
- `SERVER_READY.md` - Backend setup
- `SETUP_GUIDE.md` - Initial setup
- `START_ALL.bat` - Quick status checker

Run `START_ALL.bat` to check status of all services!

---

**Your SmartRoad app is almost ready! Just start Docker Desktop and follow the 3 steps above.**
