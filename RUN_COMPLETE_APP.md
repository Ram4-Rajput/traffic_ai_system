# 🚀 Running the Complete SmartRoad App

## Prerequisites Check

✅ Node.js installed
✅ Python installed  
✅ Backend dependencies installed
✅ Mobile dependencies installed
⚠️ Docker Desktop needs to be started

## Option 1: Full Stack with Docker (Recommended)

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** from Start Menu
2. Wait for the whale icon in system tray to become solid (not animated)
3. This may take 1-2 minutes

### Step 2: Start All Services
Open a terminal and run:
```bash
cd docker
docker-compose up
```

This will start:
- ✅ MongoDB (Database)
- ✅ Redis (Caching)
- ✅ Backend API (Node.js)
- ✅ AI Services (Python/FastAPI)
- ✅ Nginx (Reverse Proxy)
- ✅ Prometheus (Monitoring)
- ✅ Grafana (Dashboards)

### Step 3: Access Services
- Backend: http://localhost:5000
- AI Services: http://localhost:8000
- Grafana: http://localhost:3001 (admin/smartroad2024)
- Prometheus: http://localhost:9090

### Step 4: Start Mobile App
Open a new terminal:
```bash
cd mobile
npx expo start
```

---

## Option 2: Manual Setup (Without Docker)

### Terminal 1: Start Backend (Already Running!)
```bash
cd backend
node server.js
```
✅ Currently running on port 5000

### Terminal 2: Start AI Services
```bash
cd ai
py -m pip install -r requirements.txt
py main.py
```

### Terminal 3: Start Mobile App
```bash
cd mobile
npx expo start
```

---

## 📱 Mobile App Instructions

After running `npx expo start`:

### For Physical Device:
1. Install **Expo Go** app from:
   - iOS: App Store
   - Android: Google Play Store
2. Scan the QR code shown in terminal
3. App will load on your phone

### For Emulator:
- Press **'a'** for Android emulator
- Press **'i'** for iOS simulator (Mac only)
- Press **'w'** for web browser

---

## 🎯 Quick Start Commands

### Start Everything (Copy & Paste):

**Terminal 1 - Docker Services:**
```bash
cd docker
docker-compose up
```

**Terminal 2 - Mobile App:**
```bash
cd mobile
npx expo start
```

That's it! Wait 2-3 minutes for Docker to start everything.

---

## 🔍 Verify Everything is Running

### Check Backend:
```bash
curl http://localhost:5000/api/health
```

### Check AI Services:
```bash
curl http://localhost:8000/health
```

### Check Docker Services:
```bash
cd docker
docker-compose ps
```

All services should show "Up" status.

---

## 📊 What Each Service Does

| Service | Port | Purpose |
|---------|------|---------|
| Backend API | 5000 | User management, traffic data, issues |
| AI Services | 8000 | Traffic prediction, vehicle detection |
| MongoDB | 27017 | Database storage |
| Redis | 6379 | Caching and sessions |
| Nginx | 80 | Reverse proxy |
| Grafana | 3001 | Monitoring dashboards |
| Prometheus | 9090 | Metrics collection |

---

## 🎨 Mobile App Features

Once the mobile app starts, you can:
- 📍 View real-time traffic
- 🚗 Report road issues
- 🚨 Trigger emergency alerts
- 🏆 Earn rewards
- 📊 See traffic predictions
- 🗺️ Navigate with AI routing

---

## ⚠️ Troubleshooting

### Docker Desktop won't start?
- Restart your computer
- Check if Hyper-V is enabled (Windows)
- Update Docker Desktop to latest version

### Port already in use?
```bash
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

### Mobile app won't connect to backend?
1. Make sure backend is running (http://localhost:5000)
2. Update API URL in mobile app if needed
3. Check firewall settings

### AI services fail to start?
```bash
cd ai
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
```

---

## 🎯 Current Status

✅ Backend: Running on port 5000
⏳ AI Services: Ready to start
⏳ Mobile App: Ready to start
⏳ Docker Services: Need Docker Desktop running

---

## 🚀 Next Steps

1. **Start Docker Desktop** (most important!)
2. Run `cd docker && docker-compose up`
3. Wait 2-3 minutes for all services to start
4. Open new terminal: `cd mobile && npx expo start`
5. Scan QR code with Expo Go app
6. Start using the app!

---

## 📞 Quick Reference

**Stop all Docker services:**
```bash
cd docker
docker-compose down
```

**Restart a service:**
```bash
docker-compose restart backend
```

**View logs:**
```bash
docker-compose logs -f backend
```

**Rebuild services:**
```bash
docker-compose up --build
```

---

## 🎉 You're Ready!

Everything is set up. Just need to:
1. Start Docker Desktop
2. Run the commands above
3. Enjoy your SmartRoad app!
