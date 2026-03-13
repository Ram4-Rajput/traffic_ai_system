@echo off
echo ========================================
echo    GitHub Desktop Method (Easiest)
echo ========================================
echo.

echo If git command line is failing, try GitHub Desktop:
echo.
echo 1. Download GitHub Desktop:
echo    https://desktop.github.com/
echo.
echo 2. Install and login to your GitHub account
echo.
echo 3. In GitHub Desktop:
echo    - Click "Add an Existing Repository from your hard drive"
echo    - Select this folder: %cd%
echo    - It will detect all your files
echo    - Write commit message: "Complete SmartRoad project"
echo    - Click "Commit to main"
echo    - Click "Push origin"
echo.
echo 4. Done! Your project will be on GitHub
echo.
echo This method bypasses all command line issues!
echo.

echo Opening GitHub Desktop download page...
start https://desktop.github.com/

pause