@echo off
echo ========================================
echo    Safe Push to GitHub
echo ========================================
echo.

cd %~dp0

echo Cleaning up git state...
git merge --abort 2>nul
git reset --hard HEAD 2>nul

echo Current git status:
git status

echo.
echo Adding new files...
git add .gitignore
git add *.md
git add *.bat
git add *.ps1
git add backend/server-standalone.js
git add backend/init-database.js
git add mobile/src/services/api.ts

echo.
echo Committing changes...
git commit -m "Add comprehensive documentation, standalone backend, API services, and deployment scripts"

echo.
echo Pushing to GitHub...
git push origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo    SUCCESS! Project pushed to GitHub
    echo ========================================
    echo.
    echo View your project at:
    echo https://github.com/Ram4-Rajput/traffic_ai_system
) else (
    echo ========================================
    echo    Push failed - trying alternative
    echo ========================================
    echo.
    echo Trying to pull and merge first...
    git pull origin main --allow-unrelated-histories --no-edit
    echo.
    echo Now pushing...
    git push origin main
)

echo.
pause