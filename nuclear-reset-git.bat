@echo off
echo ========================================
echo    NUCLEAR GIT RESET - Fresh Start
echo ========================================
echo.
echo WARNING: This will completely reset git history
echo Press Ctrl+C to cancel, or
pause

cd %~dp0

echo Step 1: Killing any git processes...
taskkill /F /IM git.exe 2>nul

echo Step 2: Removing git repository...
rmdir /s /q .git 2>nul

echo Step 3: Initializing fresh git repository...
git init

echo Step 4: Adding remote repository...
git remote add origin https://github.com/Ram4-Rajput/traffic_ai_system.git

echo Step 5: Adding all files...
git add .

echo Step 6: Creating initial commit...
git commit -m "Complete SmartRoad Traffic Management System - Mobile App, Backend API, AI Services"

echo Step 7: Creating main branch...
git branch -M main

echo Step 8: Force pushing to GitHub (this will overwrite remote)...
git push -u origin main --force

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo    SUCCESS! Fresh repository created
    echo ========================================
    echo.
    echo Your project is now at:
    echo https://github.com/Ram4-Rajput/traffic_ai_system
) else (
    echo ========================================
    echo    FAILED - Check your GitHub credentials
    echo ========================================
    echo.
    echo Make sure you're logged into GitHub
    echo Or try using GitHub Desktop app
)

echo.
pause