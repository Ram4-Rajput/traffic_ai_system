# 📱 How to Start Your Mobile App - Step by Step

## ✅ What's Already Running
- Backend API on port 5000 ✅
- AI Services on port 8000 ✅

## 🚀 Start Mobile App - Follow These Steps

### Step 1: Open Command Prompt
1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter

### Step 2: Navigate to Mobile Folder
Copy and paste this command:
```
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
```
Press Enter

### Step 3: Start the App
Type this command:
```
npm start
```
Press Enter

### Step 4: Wait for Expo to Start
You'll see:
- "Starting Metro Bundler..."
- "Expo DevTools is running at..."
- A QR code will appear
- Options: Press w | a | i

This takes about 30-60 seconds.

### Step 5: Choose How to View

#### Option A: On Your Phone (Best Experience)
1. Install "Expo Go" app from:
   - Google Play Store (Android)
   - App Store (iOS)
2. Open Expo Go app
3. Tap "Scan QR Code"
4. Scan the QR code from your terminal
5. Wait for app to load on your phone

#### Option B: In Web Browser (Easiest)
1. Press `w` in the terminal
2. Your browser opens automatically
3. See the app at http://localhost:19006

#### Option C: Android Emulator
1. Press `a` (requires Android Studio)

#### Option D: iOS Simulator  
1. Press `i` (requires Xcode on Mac)

## 🎯 What You'll See

Once loaded, you'll see the SmartRoad mobile interface with:
- Splash screen
- Onboarding screens
- Login/Registration
- Dashboard with map
- Navigation features
- Emergency button
- Issue reporting
- Rewards section

## ⚠️ If It Doesn't Work

### Try This:
1. Close the terminal
2. Open a NEW Command Prompt
3. Run these commands:
```
set PATH=%PATH%;C:\Program Files\nodejs\
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npm start
```

### Still Not Working?
Check MOBILE_TROUBLESHOOTING.md for detailed solutions.

## 🌐 Quick Test - Web Version

The easiest way to see your app:
1. Run `npm start` in mobile folder
2. Press `w` when it starts
3. Browser opens with your app!

---

**Ready?** Open Command Prompt and follow Step 1! 🚀
