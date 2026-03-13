@echo off
echo ========================================
echo    SmartRoad Complete App Launcher
echo ========================================
echo.

echo [1/3] Starting Backend API (Standalone Mode)...
echo       No MongoDB required - using in-memory storage
echo.

start "SmartRoad Backend" cmd /k "cd backend && node server-standalone.js"
timeout /t 3 /nobreak >nul

echo [2/3] Starting AI Services...
echo.

start "SmartRoad AI" cmd /k "cd ai && py main.py"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Mobile App...
echo.

start "SmartRoad Mobile" cmd /k "cd mobile && set PATH=%PATH%;C:\Program Files\nodejs\ && npm start"

echo.
echo ========================================
echo    All Services Starting!
echo ========================================
echo.
echo Three windows will open:
echo   1. Backend API (Port 5000)
echo   2. AI Services (Port 8000)
echo   3. Mobile App (Expo)
echo.
echo Wait for all services to start, then:
echo   - Press 'w' in Mobile window to open in browser
echo   - Or scan QR code with Expo Go app
echo.
echo Test Login:
echo   Email: john@example.com
echo   Password: password123
echo.
echo Backend: http://localhost:5000
echo AI Services: http://localhost:8000
echo.
pause
