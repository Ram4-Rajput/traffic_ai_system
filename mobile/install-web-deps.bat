@echo off
echo ========================================
echo    Installing Web Dependencies
echo ========================================
echo.

echo This will install the required packages for web support...
echo.

cd %~dp0
set PATH=%PATH%;C:\Program Files\nodejs\

echo Installing react-native-web, react-dom, and webpack-config...
call npx expo install react-native-web@~0.19.6 react-dom@18.2.0 @expo/webpack-config@^19.0.0

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Now you can run: npm run web
echo.

pause
