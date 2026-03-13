@echo off
echo ========================================
echo    Starting SmartRoad Web App
echo ========================================
echo.

echo This will open the app in your web browser...
echo.

cd %~dp0
set PATH=%PATH%;C:\Program Files\nodejs\

echo Starting Expo web server...
npm run web

pause
