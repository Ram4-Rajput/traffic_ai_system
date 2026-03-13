# 📱 SmartRoad Mobile App - Quick Start Guide

## ✅ Current Status

Your SmartRoad backend and AI services are running successfully:
- ✅ Backend API: http://localhost:5000
- ✅ AI Services: http://localhost:8000

## 🚀 Start the Mobile App

### Option 1: Using Batch File (Recommended)
Double-click the file: **START_MOBILE.bat**

This will:
1. Navigate to the mobile directory
2. Start the Expo development server
3. Show you a QR code and options

### Option 2: Manual Command
Open a new Command Prompt (CMD) or PowerShell and run:

```bash
cd mobile
npm start
```

## 📱 View the Mobile App

Once the Expo server starts, you'll see several options:

### A. On Your Phone (Recommended)
1. **Install Expo Go app** on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Scan the QR code** shown in the terminal:
   - Android: Use Expo Go app to scan
   - iOS: Use Camera app to scan (it will open Expo Go)

3. **Wait for the app to load** on your phone

### B. In Web Browser
Press **'w'** in the terminal to open the app in your web browser at http://localhost:19006

### C. Android Emulator
Press **'a'** in the terminal (requires Android Studio and emulator setup)

### D. iOS Simulator
Press **'i'** in the terminal (requires Xcode on Mac)

## 🎨 Mobile App Features

Once the app loads, you'll see:

### 1. Splash Screen
- SmartRoad logo and branding
- Loading animation

### 2. Onboarding Screens
- Introduction to app features
- Swipe through tutorial screens

### 3. Registration/Login
- Create account or sign in
- Profile setup

### 4. Main Dashboard
- Real-time traffic map
- Current location
- Traffic alerts
- Quick actions

### 5. Navigation Features
- Route planning
- Real-time traffic updates
- Alternative routes
- ETA calculations

### 6. Emergency Features
- Emergency alert button
- Ambulance tracking
- Green corridor activation

### 7. Issue Reporting
- Report road issues
- Upload photos
- Track issue status

### 8. Rewards System
- View earned points
- Redeem coupons
- Partner offers

### 9. Profile & Settings
- User profile
- Preferences
- Notification settings

## 🔧 Troubleshooting

### Issue: "npm is not recognized"
**Solution**: Open Command Prompt (CMD) instead of PowerShell, or use the START_MOBILE.bat file

### Issue: "Expo command not found"
**Solution**: The app will install expo automatically when you run npm start

### Issue: QR code not scanning
**Solution**: 
1. Make sure your phone and computer are on the same WiFi network
2. Try typing the URL manually in Expo Go app
3. Or press 'w' to open in web browser

### Issue: App won't load on phone
**Solution**:
1. Check that backend is running (http://localhost:5000)
2. Make sure phone and computer are on same network
3. Try restarting the Expo server (Ctrl+C, then npm start again)

### Issue: Metro bundler errors
**Solution**:
```bash
cd mobile
rm -rf node_modules
npm install
npm start
```

## 📊 Testing the App

### Without Backend Connection:
- ✅ UI and navigation work
- ✅ Map displays
- ✅ Forms and inputs work
- ❌ Data won't save
- ❌ Real-time features won't work

### With Backend Connection:
- ✅ Full functionality
- ✅ User registration/login
- ✅ Real-time traffic updates
- ✅ Issue reporting
- ✅ Emergency alerts
- ✅ Rewards system

## 🌐 Backend Connection

The mobile app is configured to connect to:
- Backend API: http://localhost:5000
- AI Services: http://localhost:8000

If you're testing on a physical phone, you may need to update the API URLs in the app to use your computer's IP address instead of localhost.

## 📝 Development Mode Features

While in development mode, you can:
- **Shake your phone** to open developer menu
- **Reload the app** (Ctrl+R in terminal or shake phone)
- **Enable Fast Refresh** for instant updates
- **View console logs** in the terminal
- **Debug with React DevTools**

## 🎯 Next Steps

1. **Start the mobile app** using START_MOBILE.bat
2. **Scan the QR code** with Expo Go on your phone
3. **Explore the UI** and test features
4. **Optional**: Start Docker for full database functionality

## 📱 App Architecture

```
SmartRoad Mobile App
├── Splash Screen
├── Onboarding
├── Authentication
│   ├── Login
│   └── Registration
├── Main Navigation
│   ├── Dashboard (Home)
│   ├── Navigation
│   ├── Emergency
│   ├── Explore
│   └── Profile
└── Features
    ├── Real-time Traffic
    ├── Route Planning
    ├── Issue Reporting
    ├── Emergency Alerts
    └── Rewards System
```

## 🔗 Useful Commands

```bash
# Start the app
npm start

# Start with cache cleared
npm start --clear

# Start on specific platform
npm run android
npm run ios
npm run web

# Stop the server
Ctrl + C
```

---

**Ready to see your SmartRoad app in action!** 🚗💨

Run START_MOBILE.bat and scan the QR code with Expo Go on your phone!
