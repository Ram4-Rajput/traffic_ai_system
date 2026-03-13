@echo off
cls
echo ========================================
echo    SmartRoad Mobile App Launcher
echo ========================================
echo.
echo Backend API: http://localhost:5000 [RUNNING]
echo AI Services: http://localhost:8000 [RUNNING]
echo.
echo Starting Mobile App...
echo.
echo Once started:
echo   - Press 'w' to open in WEB BROWSER (easiest!)
echo   - Or scan QR code with Expo Go app on your phone
echo.
echo Test Login:
echo   Email: john@example.com
echo   Password: password123
echo.
echo ========================================
echo.

cd mobile
set PATH=%PATH%;C:\Program Files\nodejs\
npm start

pause
