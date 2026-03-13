# SmartRoad Setup Guide

## Current Status
✅ Docker is installed (v29.2.1)
❌ Node.js/npm is NOT installed
❌ Python is NOT installed

## Installation Steps

### Step 1: Install Required Software

#### Install Node.js (Required for Backend & Mobile)
1. Download Node.js 18+ from: https://nodejs.org/
2. Run the installer and follow the prompts
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Install Python (Required for AI Services)
1. Download Python 3.11+ from: https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```bash
   python --version
   pip --version
   ```

### Step 2: Setup Environment Files

#### Backend Environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/smartroad
PORT=5000
JWT_SECRET=change-this-to-a-secure-random-string
CLIENT_URL=http://localhost:3000
```

#### AI Services Environment
Create `ai/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/smartroad_ai
REDIS_URL=redis://localhost:6379
MODEL_PATH=/app/models
LOG_LEVEL=INFO
```

### Step 3: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Mobile Dependencies
```bash
cd mobile
npm install
npx expo install
```

#### AI Dependencies
```bash
cd ai
pip install -r requirements.txt
```

### Step 4: Run the Project

## Option A: Using Docker (RECOMMENDED - Easiest)

This will start everything (MongoDB, Redis, Backend, AI services):

```bash
cd docker
docker-compose up -d
```

Check status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

Access services:
- Backend API: http://localhost:5000
- AI Services: http://localhost:8000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

Stop services:
```bash
docker-compose down
```

## Option B: Manual Setup (For Development)

### 1. Start MongoDB & Redis
```bash
cd docker
docker-compose up -d mongodb redis
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Start AI Services
```bash
cd ai
python main.py
```

### 4. Start Mobile App
```bash
cd mobile
npx expo start
```

Then:
- Press 'a' for Android emulator
- Press 'i' for iOS simulator
- Scan QR code with Expo Go app on your phone

## Quick Start Commands

After installing Node.js and Python:

```bash
# Install all dependencies
cd backend && npm install && cd ..
cd mobile && npm install && cd ..
cd ai && pip install -r requirements.txt && cd ..

# Setup environment
cp backend/.env.example backend/.env

# Run with Docker
cd docker
docker-compose up -d
```

## Troubleshooting

### Port Already in Use
If ports are occupied:
- MongoDB: 27017
- Redis: 6379
- Backend: 5000
- AI Services: 8000

Stop conflicting services or change ports in docker-compose.yml

### Docker Issues
```bash
# Restart Docker Desktop
# Then rebuild containers
docker-compose down
docker-compose up -d --build
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Python Dependencies Issues
```bash
# Upgrade pip first
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Next Steps After Setup

1. Test Backend API: http://localhost:5000/api/health
2. Test AI Services: http://localhost:8000/health
3. Open mobile app with Expo
4. Check Grafana dashboards: http://localhost:3001 (admin/smartroad2024)

## Development Workflow

1. Make code changes
2. Backend auto-reloads with nodemon
3. Mobile hot-reloads with Expo
4. AI services need manual restart

## Production Deployment

For production, use:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Support

- Check logs: `docker-compose logs -f [service-name]`
- Restart service: `docker-compose restart [service-name]`
- Rebuild: `docker-compose up -d --build [service-name]`
