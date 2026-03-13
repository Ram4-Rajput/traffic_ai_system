# 🚀 Starting SmartRoad Project

## ⚠️ Docker Desktop Issue

Docker Desktop is not running. You have two options:

---

## Option 1: Start Docker Desktop (Recommended)

1. **Open Docker Desktop application** from Start Menu
2. **Wait for it to fully start** (whale icon in system tray turns solid)
3. **Then run:**
   ```bash
   cd docker
   docker-compose up
   ```

This will start all services together.

---

## Option 2: Run Services Manually (Without Docker)

Since Docker isn't running, let's start the backend and mobile app directly:

### Step 1: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

**Expected Output:**
```
SmartRoad API Server running on port 5000
Connected to MongoDB
```

**Note:** Backend will try to connect to MongoDB. If MongoDB isn't running, you'll see connection errors, but the server will still start.

### Step 2: Start Mobile App

Open another terminal and run:
```bash
cd mobile
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

### Step 3: Test Backend

Open browser or run:
```bash
curl http://localhost:5000/api/health
```

---

## 🎯 Quick Test Without Docker

Let me start the backend for you to see the output!

### Backend Server Starting...
