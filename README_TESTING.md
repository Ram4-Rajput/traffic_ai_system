# 🚀 SmartRoad - Complete Testing Guide

## 📊 Current Status

### ✅ What's Running:
1. **Backend API** - Port 5000 ✅
2. **AI Services** - Port 8000 ✅

### ⚠️ What's Missing:
3. **MongoDB** - Database for data persistence ❌
4. **Mobile App** - User interface ⏳

## 🎯 To Test COMPLETE Functionality

You need MongoDB to test the full app (not just the UI).

### Quick Decision Tree:

**Do you have MongoDB installed?**

#### ✅ YES → You're ready!
1. Run: `CHECK_MONGODB.bat` to verify
2. Run: `cd backend && node init-database.js` to add sample data
3. Run: `cd mobile && npm start` to start app
4. Press `w` for web or scan QR code

#### ❌ NO → Install MongoDB (5 minutes)

**Choose ONE option:**

**Option 1: MongoDB Community (Easiest)**
- Download: https://www.mongodb.com/try/download/community
- Install → Check "Install as Service" → Done!
- Auto-starts on Windows

**Option 2: Docker Desktop**
- Install Docker Desktop
- Run: `cd docker && docker-compose up -d mongodb redis`

**Option 3: MongoDB Atlas (Cloud - No install)**
- Sign up: https://www.mongodb.com/cloud/atlas/register
- Create free cluster
- Update backend/.env with connection string

## 📱 Testing Steps

### Step 1: Verify MongoDB
```cmd
CHECK_MONGODB.bat
```

### Step 2: Initialize Database
```cmd
cd backend
node init-database.js
```

Creates sample:
- Users (john@example.com / password123)
- Traffic data
- Road issues
- Partners & coupons

### Step 3: Check Backend Connection
Open: http://localhost:5000/api/health

Should show: `"database": "connected"`

### Step 4: Start Mobile App
```cmd
cd mobile
npm start
```

Press `w` to open in browser!


## 🧪 What You Can Test

### With MongoDB (Full Functionality):
✅ User registration & login
✅ Report road issues with photos
✅ View real-time traffic data
✅ Emergency alerts
✅ Rewards system (earn & redeem)
✅ Navigation with live updates
✅ Data persistence
✅ Real-time Socket.IO updates

### Without MongoDB (UI Only):
✅ View interface
✅ Navigate screens
✅ See UI components
❌ Can't save data
❌ Can't login/register
❌ No real functionality

## 🎮 Test Scenarios

### Scenario 1: New User Journey
1. Open mobile app
2. Register new account
3. Login
4. View dashboard
5. Report a road issue
6. Check rewards
7. Redeem a coupon

### Scenario 2: Traffic Monitoring
1. View traffic map
2. See congestion levels
3. Get route suggestions
4. View AI predictions

### Scenario 3: Emergency Response
1. Trigger emergency alert
2. System creates green corridor
3. Notifies nearby users
4. Tracks ambulance route

## 📋 Files Created for You

- `CHECK_MONGODB.bat` - Check if MongoDB is installed
- `SETUP_MONGODB.md` - MongoDB installation guide
- `FULL_APP_TESTING_GUIDE.md` - Complete testing instructions
- `backend/init-database.js` - Database initialization script
- `README_TESTING.md` - This file

## 🚀 Quick Start (If MongoDB Ready)

```cmd
REM 1. Check MongoDB
CHECK_MONGODB.bat

REM 2. Initialize database
cd backend
node init-database.js

REM 3. Verify connection
curl http://localhost:5000/api/health

REM 4. Start mobile app
cd ..\mobile
npm start
```

Press `w` to open in browser!

## 💡 Pro Tips

1. **Use web browser** - Press `w` when mobile app starts (easiest way to test)
2. **Sample login** - Email: john@example.com, Password: password123
3. **Check health endpoint** - http://localhost:5000/api/health shows DB status
4. **View logs** - Backend and AI terminals show all activity
5. **MongoDB Compass** - GUI tool to view database (installed with MongoDB)

## 🆘 Need Help?

### MongoDB not connecting?
- Run `CHECK_MONGODB.bat`
- Check if service is running: `net start MongoDB`
- View logs in backend terminal

### Mobile app not starting?
- Use Command Prompt (not PowerShell)
- Run: `cd mobile && npm start`
- Press `w` for web version

### Can't see data?
- Check: http://localhost:5000/api/health
- Must show "database": "connected"
- Run init-database.js again

---

**Ready to test the complete app?** 
1. Run `CHECK_MONGODB.bat`
2. Follow the instructions
3. Enjoy your SmartRoad app! 🎉
