@echo off
echo ========================================
echo    Fixing Git Repository State
echo ========================================
echo.

cd %~dp0

echo Aborting any pending merge...
git merge --abort 2>nul

echo Resetting to clean state...
git reset --hard HEAD 2>nul

echo Checking status...
git status

echo.
echo ========================================
echo    Git Fixed! Now you can commit
echo ========================================
echo.

pause