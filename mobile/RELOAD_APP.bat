@echo off
echo ========================================
echo    Force Reload SmartRoad App
echo ========================================
echo.

cd %~dp0
set PATH=%PATH%;C:\Program Files\nodejs\

echo Stopping any running instances...
taskkill /F /IM node.exe /T 2>nul

echo.
echo Clearing Expo cache...
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo.
echo Starting with clean cache...
npm start -- --clear

pause
