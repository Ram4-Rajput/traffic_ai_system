@echo off
echo ========================================
echo    Checking MongoDB Installation
echo ========================================
echo.

REM Check if MongoDB is installed
where mongo >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB is installed
    mongo --version
    echo.
    
    REM Check if MongoDB service is running
    sc query MongoDB | find "RUNNING" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MongoDB service is RUNNING
        echo.
        echo ========================================
        echo    MongoDB is Ready!
        echo ========================================
        echo.
        echo You can now initialize the database:
        echo   cd backend
        echo   node init-database.js
        echo.
        echo Then start the mobile app:
        echo   cd mobile
        echo   npm start
        echo.
    ) else (
        echo [!] MongoDB service is NOT running
        echo.
        echo Starting MongoDB service...
        net start MongoDB
        if %errorlevel% equ 0 (
            echo [OK] MongoDB service started successfully!
        ) else (
            echo [ERROR] Failed to start MongoDB service
            echo Please start it manually or check installation
        )
    )
) else (
    echo [!] MongoDB is NOT installed
    echo.
    echo ========================================
    echo    Install MongoDB
    echo ========================================
    echo.
    echo Option 1: MongoDB Community Edition
    echo   Download: https://www.mongodb.com/try/download/community
    echo   Install with default settings
    echo   Check "Install as Windows Service"
    echo.
    echo Option 2: Docker Desktop
    echo   Download: https://www.docker.com/products/docker-desktop/
    echo   Then run: docker-compose up -d mongodb redis
    echo.
    echo Option 3: MongoDB Atlas (Cloud)
    echo   Sign up: https://www.mongodb.com/cloud/atlas/register
    echo   Create free cluster
    echo   Update backend/.env with connection string
    echo.
    echo See SETUP_MONGODB.md for detailed instructions
    echo.
)

echo.
pause
