# ⚡ Next Steps - Quick Guide

## 🔄 Step 1: Restart Your Terminal
After installing Node.js and Python, you MUST restart your terminal/PowerShell for them to work.

**Close this terminal and open a new one**, then verify:
```bash
node --version
npm --version
python --version
pip --version
```

All commands should show version numbers.

---

## 📦 Step 2: Install All Dependencies

Once the terminal recognizes the commands, run this:

```bash
install-dependencies.bat
```

This will install:
- Backend packages (~2-3 minutes)
- Mobile packages (~3-5 minutes)
- AI packages (~5-10 minutes)

---

## 🚀 Step 3: Start the Project

### Option A: Using Docker (Recommended)
```bash
cd docker
docker-compose up -d
```

Wait 1-2 minutes for all services to start, then test:
- Backend: http://localhost:5000/api/health
- AI Services: http://localhost:8000/health
- Grafana: http://localhost:3001

### Option B: Manual (For Development)

**Terminal 1 - Start Database:**
```bash
cd docker
docker-compose up -d mongodb redis
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Start AI Services:**
```bash
cd ai
python main.py
```

**Terminal 4 - Start Mobile App:**
```bash
cd mobile
npx expo start
```

---

## ✅ Verify Everything Works

After starting with Docker:

1. **Test Backend:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test AI Services:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return health status

3. **Check Docker:**
   ```bash
   docker-compose ps
   ```
   All services should show "Up"

---

## 🎯 Quick Commands Reference

```bash
# Check installations
node --version
npm --version
python --version
pip --version

# Install dependencies
install-dependencies.bat

# Start everything
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart a service
docker-compose restart backend
```

---

## ⚠️ Troubleshooting

### Commands not found after install
→ **Restart your terminal/PowerShell**
→ Or restart your computer

### Python shows Microsoft Store
→ Disable Python app execution alias:
   1. Settings → Apps → Advanced app settings
   2. App execution aliases
   3. Turn OFF both Python entries

### npm install fails
→ Run as Administrator
→ Or try: `npm install --legacy-peer-deps`

### Docker not starting
→ Open Docker Desktop application
→ Wait for it to fully start (whale icon in system tray)

---

## 📱 Mobile App Setup

After backend is running:

1. Install Expo Go app on your phone (iOS/Android)
2. Run: `cd mobile && npx expo start`
3. Scan QR code with Expo Go app
4. App will load on your phone

---

## 🎉 You're Almost There!

1. ✅ Node.js installed
2. ✅ Python installed
3. ⏳ Restart terminal (IMPORTANT!)
4. ⏳ Run `install-dependencies.bat`
5. ⏳ Run `cd docker && docker-compose up -d`
6. ✅ Project running!

**Current Step: Restart your terminal and verify installations!**
