@echo off
echo ========================================
echo    Starting SmartRoad Mobile App
echo ========================================
echo.

REM Add Node.js to PATH
set PATH=%PATH%;C:\Program Files\nodejs\

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo Navigating to mobile directory...
cd mobile

echo.
echo Starting Expo development server...
echo This may take a minute...
echo.
echo Once started, you will see:
echo - A QR code to scan with Expo Go app
echo - Press 'w' to open in web browser
echo - Press 'a' for Android emulator
echo - Press 'i' for iOS simulator
echo.

call npm start

pause
