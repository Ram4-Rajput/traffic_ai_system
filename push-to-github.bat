@echo off
echo ========================================
echo    Push SmartRoad to GitHub
echo ========================================
echo.

cd %~dp0

echo Step 1: Abort any pending operations...
git merge --abort 2>nul
git rebase --abort 2>nul

echo Step 2: Reset to clean state...
git reset --hard HEAD

echo Step 3: Check current status...
git status

echo Step 4: Add all files...
git add .

echo Step 5: Commit changes...
git commit -m "Complete SmartRoad project with mobile app, backend, AI services, and documentation"

echo Step 6: Force push to GitHub...
git push origin main --force

echo.
echo ========================================
echo    Push Complete!
echo ========================================
echo.
echo Your project is now on GitHub:
echo https://github.com/Ram4-Rajput/traffic_ai_system
echo.

pause