@echo off
echo === SmartRoad Dependencies Installer ===
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed

echo.
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed
    echo Please install from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python is installed

echo.
echo === Installing Backend Dependencies ===
cd backend
call npm install
cd ..

echo.
echo === Installing Mobile Dependencies ===
cd mobile
call npm install
cd ..

echo.
echo === Installing AI Dependencies ===
cd ai
pip install -r requirements.txt
cd ..

echo.
echo === Installation Complete ===
echo Next: Run "cd docker" and "docker-compose up -d"
pause
