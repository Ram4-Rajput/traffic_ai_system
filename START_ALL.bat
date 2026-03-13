@echo off
echo ========================================
echo    SmartRoad Complete App Launcher
echo ========================================
echo.

echo Checking services...
echo.

echo [1/4] Backend Server Status...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 5000
) else (
    echo [!] Backend is not running
    echo     Start it with: cd backend ^&^& node server.js
)
echo.

echo [2/4] AI Services Status...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AI Services running on port 8000
) else (
    echo [!] AI Services not running
    echo     Start it with: cd ai ^&^& py main.py
)
echo.

echo [3/4] Docker Status...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is running
) else (
    echo [!] Docker Desktop is not running
    echo     Please start Docker Desktop application
)
echo.

echo [4/4] Mobile App...
echo     Start with: cd mobile ^&^& npx expo start
echo.

echo ========================================
echo          Access Your App
echo ========================================
echo.
echo Backend Dashboard: http://localhost:5000
echo AI Services: http://localhost:8000
echo.
echo To start mobile app:
echo   1. Open new terminal
echo   2. Run: cd mobile
echo   3. Run: npx expo start
echo   4. Scan QR code with Expo Go app
echo.
pause
